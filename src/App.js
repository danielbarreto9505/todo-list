import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faClipboardList } from '@fortawesome/free-solid-svg-icons';

class App extends Component {
  state = {
    items: [],
    currentItem: {
      id: null,
      titulo: '',
      isActive: true,
    },
    showModal: false,
    modalTitle: '',
    modalIsActive: true,
    editModalTitle: '',
    editModalIsActive: true,
    editingItemId: null,
  };

  componentDidMount() {
    this.fetchTodoList();
  }

  fetchTodoList = async () => {
    try {
      const response = await fetch('http://localhost:5243/api/TodoList/Lista');
      const data = await response.json();
      this.setState({ items: data.response });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      currentItem: {
        ...prevState.currentItem,
        [name]: value,
      },
    }));
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    this.openModal();
  };

  handleModalInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const inputValue = type === 'checkbox' ? checked : value;
    this.setState({
      [name]: inputValue,
    });
  };

  handleModalSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5243/api/TodoList/Crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: this.state.modalTitle,
          isActive: this.state.modalIsActive,
        }),
      });
      await response.json();
      this.fetchTodoList();
      this.closeModal();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  handleEdit = (item) => {
    this.setState({
      editingItemId: item.id,
      editModalTitle: item.titulo,
      editModalIsActive: item.isActive,
    });
    this.openModal();
  };

  handleDelete = async (itemId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`http://localhost:5243/api/TodoList/${itemId}`, {
            method: 'DELETE',
          });
          this.fetchTodoList();
          Swal.fire('Eliminado', 'El elemento ha sido eliminado.', 'success');
        } catch (error) {
          console.error('Error deleting item:', error);
          Swal.fire('Error', 'Ha ocurrido un error al eliminar el elemento.', 'error');
        }
      }
    });
  };

  openModal = () => {
    this.setState({
      showModal: true,
      modalTitle: '',
      modalIsActive: true,
    });
  };

  closeModal = () => {
    this.setState({ showModal: false, editingItemId: null });
  };

  handleModalEditSubmit = async () => {
    try {
      const { editingItemId, editModalTitle, editModalIsActive } = this.state;
      const response = await fetch(`http://localhost:5243/api/TodoList/${editingItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: editModalTitle,
          isActive: editModalIsActive,
        }),
      });
      await response.json();
      this.fetchTodoList();
      this.closeModal();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  render() {
    const {
      items,
      currentItem,
      showModal,
      modalTitle,
      modalIsActive,
      editModalTitle,
      editModalIsActive,
      editingItemId,
    } = this.state;

    return (
      <div className="App">
        <div className="container">
          <h1 className="mt-4">
            <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> TO DO LIST
          </h1>
          <form onSubmit={this.handleSubmit} className="mb-4">
            <button type="submit" className="btn btn-primary">
              {currentItem.id ? 'Actualizar' : 'Crear'}
            </button>
          </form>
          <ul className="list-group">
            <li className="list-group-item d-flex justify-content-between align-items-center font-weight-bold">
              Titulo - Estado
            </li>
            {items.map((item) => (
              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                {item.titulo} - {item.isActive ? 'Inactivo' : 'Activo'}
                <div>
                  <button className="btn btn-sm btn-warning mr-2" onClick={() => this.handleEdit(item)}>
                    Editar
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => this.handleDelete(item.id)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Modal */}
        <Modal show={showModal} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>Nueva Tarea</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <label htmlFor="modalTitle">Título</label>
              <input
                type="text"
                className="form-control"
                id="modalTitle"
                name="modalTitle"
                value={modalTitle}
                onChange={this.handleModalInputChange}
              />
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="modalIsActive"
                name="modalIsActive"
                checked={modalIsActive}
                onChange={this.handleModalInputChange}
              />
              <label className="form-check-label" htmlFor="modalIsActive">
                Activo
              </label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={this.handleModalSubmit}>
              Crear
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Modal */}
        <Modal show={editingItemId !== null} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Tarea</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <label htmlFor="editModalTitle">Título</label>
              <input
                type="text"
                className="form-control"
                id="editModalTitle"
                name="editModalTitle"
                value={editModalTitle}
                onChange={this.handleModalInputChange}
              />
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="editModalIsActive"
                name="editModalIsActive"
                checked={editModalIsActive}
                onChange={this.handleModalInputChange}
              />
              <label className="form-check-label" htmlFor="editModalIsActive">
                Activo
              </label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={this.handleModalEditSubmit}>
              Actualizar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default App;
