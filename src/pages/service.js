import React, { useState, useEffect } from 'react';
import axios from 'axios';


const Services = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInputs, setShowInputs] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

 
  const baseUrl = 'https://toothpix-backend.onrender.com/api/app/services';

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.get(baseUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setServices(response.data.services);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to fetch services.');
    } finally {
      setIsLoading(false);
    }
  };

  const addService = async () => {
    if (!name || !price) {
      setError('Service Name and Price cannot be empty!');
      return;
    }

    const body = {
      name,
      description: description || null,
      price: parseFloat(price).toFixed(2),
    };

    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.post(baseUrl, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 201) {
        fetchServices();
        setName('');
        setDescription('');
        setPrice('');
        setShowInputs(false);
      } else {
        setError('Failed to add service.');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      setError('Failed to add service. Please try again later.');
    }
  };

  const updateService = async () => {
    if (!selectedService) return;

    const body = {
      name: selectedService.name,
      description: selectedService.description || null,
      price: parseFloat(selectedService.price).toFixed(2),
    };

    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.put(`${baseUrl}/${selectedService.idservice}`, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        fetchServices();
        setSelectedService(null);
      } else {
        setError('Failed to update service.');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      setError('Failed to update service. Please try again later.');
    }
  };

  const deleteService = async (id) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.delete(`${baseUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setServices(services.filter((service) => service.idservice !== id));
      } else {
        setError('Failed to delete service.');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      setError('Failed to delete service. Please try again later.');
    }
  };

  return (
    <div style={{ width: '100%' }}>
    <div className="services-container">
      <h2 className="mb-4">Dental Services</h2>
  
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {error && <div style={{ color: 'red' }}>{error}</div>}
  
          <button
            onClick={() => setShowInputs(!showInputs)}
            className="btn btn-primary mb-3"
          >
            {showInputs ? 'Cancel' : 'Add New Service'}
          </button>
  
          {showInputs && (
            <div className="dashboard-card mb-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Service Name"
                className="form-control mb-2"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="form-control mb-2"
              />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                className="form-control mb-2"
              />
              <button onClick={addService} className="btn btn-success">
                Add Service
              </button>
            </div>
          )}
  
          {services.map((service) => (
            <div className="service-row" key={service.idservice}>
              <div className="service-name">{service.name}</div>
              <div className="service-actions">
                <button
                  onClick={() => setSelectedService(service)}
                  className="btn btn-warning btn-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteService(service.idservice)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
  
  
};

export default Services;
