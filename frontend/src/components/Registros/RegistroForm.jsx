import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const RegistroForm = ({ registroExistente, onSuccess }) => {
  const navigate = useNavigate();
  const [centros, setCentros] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  
  // Estado inicial del formulario
  const initialFormData = {
    ambiente: registroExistente?.ambiente?.id || '',
    categoria_base: registroExistente?.categoria_base || '',
    subcategoria_1: registroExistente?.subcategoria_1 || 'General',
    subcategoria_2: registroExistente?.subcategoria_2 || '',
    subcategoria_3: registroExistente?.subcategoria_3 || '',
    tipo_aire: registroExistente?.tipo_aire || '',
    refrigerante: registroExistente?.refrigerante || '',
    frecuencia_uso: registroExistente?.frecuencia_uso || '',
    horas_dia: registroExistente?.horas_dia || 0,
    dias_mes: registroExistente?.dias_mes || 0,
    potencia_w: registroExistente?.potencia_w || 0,
    voltaje_v: registroExistente?.voltaje_v || 0,
    corriente_a: registroExistente?.corriente_a || 0,
    observaciones: registroExistente?.observaciones || ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [centrosRes, sedesRes] = await Promise.all([
          api.get('/centros/'),
          api.get('/sedes/')
        ]);
        setCentros(centrosRes.data);
        setSedes(sedesRes.data);
        
        if (registroExistente?.ambiente?.sede) {
          const ambientesRes = await api.get(`/ambientes/?sede=${registroExistente.ambiente.sede}`);
          setAmbientes(ambientesRes.data);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    
    fetchData();
  }, [registroExistente]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Manejar cambio de sede para cargar ambientes
  const handleSedeChange = async (sedeId) => {
    try {
      const response = await api.get(`/ambientes/?sede=${sedeId}`);
      setAmbientes(response.data);
      setFormData({
        ...formData,
        ambiente: '' // Resetear ambiente al cambiar sede
      });
    } catch (error) {
      console.error('Error cargando ambientes:', error);
    }
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};
    
    // Validaciones básicas
    if (!formData.ambiente) newErrors.ambiente = 'Seleccione un ambiente';
    if (!formData.categoria_base) newErrors.categoria_base = 'Seleccione una categoría';
    if (!formData.frecuencia_uso) newErrors.frecuencia_uso = 'Seleccione frecuencia de uso';
    if (formData.horas_dia <= 0) newErrors.horas_dia = 'Horas debe ser mayor a 0';
    if (formData.dias_mes <= 0) newErrors.dias_mes = 'Días debe ser mayor a 0';
    if (formData.potencia_w <= 0) newErrors.potencia_w = 'Potencia debe ser mayor a 0';
    
    // Validaciones específicas para aire acondicionado
    if (formData.categoria_base.toLowerCase() === 'aire acondicionado') {
      if (!formData.tipo_aire) newErrors.tipo_aire = 'Seleccione tipo de aire';
      if (!formData.refrigerante) newErrors.refrigerante = 'Seleccione refrigerante';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (registroExistente) {
        // Actualizar registro existente
        await api.put(`/registros/${registroExistente.id}/`, formData);
      } else {
        // Crear nuevo registro
        await api.post('/registros/', formData);
      }
      
      onSuccess ? onSuccess() : navigate('/registros');
    } catch (error) {
      console.error('Error guardando registro:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    }
  };

  // Opciones para selects
  const categoriasOptions = [
    'Aire Acondicionado',
    'Iluminación',
    'Equipos de Cómputo',
    'Electrodomésticos',
    'Maquinaria'
  ];

  const tipoAireOptions = [
    { value: 'SPLIT', label: 'Split' },
    { value: 'VENTANA', label: 'De Ventana' },
    { value: 'PORTATIL', label: 'Portátil' },
    { value: 'CENTRAL', label: 'Sistema Centralizado' }
  ];

  const refrigeranteOptions = [
    { value: 'R22', label: 'R-22' },
    { value: 'R410A', label: 'R-410A' },
    { value: 'R32', label: 'R-32' },
    { value: 'R134A', label: 'R-134A' }
  ];

  const frecuenciaOptions = [
    'Diario',
    'Semanal',
    'Quincenal',
    'Mensual',
    'Ocasional'
  ];

  return (
    <form onSubmit={handleSubmit} className="registro-form">
      <h2>{registroExistente ? 'Editar' : 'Nuevo'} Registro Energético</h2>
      
      {/* Selección de Ambiente */}
      <div className={`form-group ${errors.ambiente ? 'has-error' : ''}`}>
        <label>Centro:</label>
        <select 
          onChange={(e) => {
            const centroId = e.target.value;
            const sedesFiltradas = sedes.filter(s => s.centro == centroId);
            setSedes(sedesFiltradas);
            setFormData({...formData, sede: '', ambiente: ''});
          }}
          value={formData.sede ? sedes.find(s => s.id == formData.sede)?.centro || '' : ''}
        >
          <option value="">Seleccione un centro</option>
          {centros.map(centro => (
            <option key={centro.id} value={centro.id}>{centro.nombre}</option>
          ))}
        </select>
      </div>
      
      <div className={`form-group ${errors.ambiente ? 'has-error' : ''}`}>
        <label>Sede:</label>
        <select 
          onChange={(e) => handleSedeChange(e.target.value)}
          value={formData.sede || ''}
          name="sede"
        >
          <option value="">Seleccione una sede</option>
          {sedes.map(sede => (
            <option key={sede.id} value={sede.id}>{sede.nombre}</option>
          ))}
        </select>
      </div>
      
      <div className={`form-group ${errors.ambiente ? 'has-error' : ''}`}>
        <label>Ambiente:</label>
        <select
          name="ambiente"
          value={formData.ambiente}
          onChange={handleChange}
          disabled={!formData.sede}
        >
          <option value="">Seleccione un ambiente</option>
          {ambientes.map(ambiente => (
            <option key={ambiente.id} value={ambiente.id}>
              {ambiente.nombre} - {ambiente.bloque} {ambiente.piso}
            </option>
          ))}
        </select>
        {errors.ambiente && <span className="error-text">{errors.ambiente}</span>}
      </div>
      
      {/* Categorización */}
      <div className={`form-group ${errors.categoria_base ? 'has-error' : ''}`}>
        <label>Categoría Principal:</label>
        <select
          name="categoria_base"
          value={formData.categoria_base}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione una categoría</option>
          {categoriasOptions.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.categoria_base && <span className="error-text">{errors.categoria_base}</span>}
      </div>
      
      <div className="form-group">
        <label>Subcategoría Nivel 1:</label>
        <input
          type="text"
          name="subcategoria_1"
          value={formData.subcategoria_1}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Subcategoría Nivel 2 (opcional):</label>
        <input
          type="text"
          name="subcategoria_2"
          value={formData.subcategoria_2 || ''}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label>Subcategoría Nivel 3 (opcional):</label>
        <input
          type="text"
          name="subcategoria_3"
          value={formData.subcategoria_3 || ''}
          onChange={handleChange}
        />
      </div>
      
      {/* Campos específicos para Aire Acondicionado */}
      {formData.categoria_base.toLowerCase() === 'aire acondicionado' && (
        <>
          <div className={`form-group ${errors.tipo_aire ? 'has-error' : ''}`}>
            <label>Tipo de Aire Acondicionado:</label>
            <select
              name="tipo_aire"
              value={formData.tipo_aire}
              onChange={handleChange}
            >
              <option value="">Seleccione un tipo</option>
              {tipoAireOptions.map((opt, index) => (
                <option key={index} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.tipo_aire && <span className="error-text">{errors.tipo_aire}</span>}
          </div>
          
          <div className={`form-group ${errors.refrigerante ? 'has-error' : ''}`}>
            <label>Refrigerante:</label>
            <select
              name="refrigerante"
              value={formData.refrigerante}
              onChange={handleChange}
            >
              <option value="">Seleccione un refrigerante</option>
              {refrigeranteOptions.map((opt, index) => (
                <option key={index} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.refrigerante && <span className="error-text">{errors.refrigerante}</span>}
          </div>
        </>
      )}
      
      {/* Datos de consumo */}
      <div className={`form-group ${errors.frecuencia_uso ? 'has-error' : ''}`}>
        <label>Frecuencia de Uso:</label>
        <select
          name="frecuencia_uso"
          value={formData.frecuencia_uso}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione frecuencia</option>
          {frecuenciaOptions.map((freq, index) => (
            <option key={index} value={freq}>{freq}</option>
          ))}
        </select>
        {errors.frecuencia_uso && <span className="error-text">{errors.frecuencia_uso}</span>}
      </div>
      
      <div className={`form-group ${errors.horas_dia ? 'has-error' : ''}`}>
        <label>Horas por Día:</label>
        <input
          type="number"
          name="horas_dia"
          min="0"
          max="24"
          step="0.5"
          value={formData.horas_dia}
          onChange={handleChange}
          required
        />
        {errors.horas_dia && <span className="error-text">{errors.horas_dia}</span>}
      </div>
      
      <div className={`form-group ${errors.dias_mes ? 'has-error' : ''}`}>
        <label>Días por Mes:</label>
        <input
          type="number"
          name="dias_mes"
          min="0"
          max="31"
          value={formData.dias_mes}
          onChange={handleChange}
          required
        />
        {errors.dias_mes && <span className="error-text">{errors.dias_mes}</span>}
      </div>
      
      <div className={`form-group ${errors.potencia_w ? 'has-error' : ''}`}>
        <label>Potencia (W):</label>
        <input
          type="number"
          name="potencia_w"
          min="0"
          step="0.01"
          value={formData.potencia_w}
          onChange={handleChange}
          required
        />
        {errors.potencia_w && <span className="error-text">{errors.potencia_w}</span>}
      </div>
      
      <div className="form-group">
        <label>Voltaje (V) (opcional):</label>
        <input
          type="number"
          name="voltaje_v"
          min="0"
          step="0.01"
          value={formData.voltaje_v || ''}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label>Corriente (A) (opcional):</label>
        <input
          type="number"
          name="corriente_a"
          min="0"
          step="0.01"
          value={formData.corriente_a || ''}
          onChange={handleChange}
        />
      </div>
      
      {/* Observaciones */}
      <div className="form-group">
        <label>Observaciones:</label>
        <textarea
          name="observaciones"
          value={formData.observaciones || ''}
          onChange={handleChange}
          rows="3"
        />
      </div>
      
      {/* Botones */}
      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {registroExistente ? 'Actualizar' : 'Guardar'} Registro
        </button>
        <button 
          type="button" 
          className="btn-secondary"
          onClick={() => navigate('/registros')}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default RegistroForm;