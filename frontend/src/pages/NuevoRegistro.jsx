import React, { useState } from 'react';
import './NuevoRegistro.css';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const categorias = {
  'Aire Acondicionado': ['Split', 'Ventana', 'Portátil', 'Central'],
  'Equipo de Cómputo': ['Computador', 'Impresora', 'Router'],
  'Iluminación': ['Bombillo LED', 'Bombillo Fluorescente', 'Reflector', 'Luminaria'],
  'Equipo Industrial': [],
  'Equipo de Laboratorio': [],
  'Herramientas': [],
  'Electrodomésticos': []
};

const opcionesTipoAire = ['SPLIT', 'VENTANA', 'PORTATIL', 'CENTRAL'];
const opcionesRefrigerante = ['R22', 'R410A', 'R32', 'R134A'];
const opcionesClasificacion = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const NuevoRegistro = () => {
  const [formData, setFormData] = useState({
    correo_usuario: '',
    categoria_base: '',
    subcategoria_1: '',
    subcategoria_2: '',
    subcategoria_3: '',
    tipo_aire: '',
    refrigerante: '',
    clasificacion_energetica: '',
    frecuencia_uso: '',
    horas_dia: '',
    dias_mes: '',
    potencia_w: '',
    voltaje_v: '',
    corriente_a: '',
    observaciones: ''
  });

  const [imagenes, setImagenes] = useState([null, null]);



  const [nuevoAmbiente, setNuevoAmbiente] = useState({
    sede: '',
    bloque: '',
    piso: '',
    tipo_ambiente: '',
    nombre: ''
  });

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'categoria_base') {
      setFormData(prev => ({
        ...prev,
        categoria_base: value,
        subcategoria_1: '',
        subcategoria_2: '',
        subcategoria_3: '',
        tipo_aire: '',
        refrigerante: '',
        clasificacion_energetica: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNuevoAmbienteChange = (e) => {
    setNuevoAmbiente(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e, shouldContinue = false) => {
    e.preventDefault();
    setErrores({});
    setMensaje('');
    setLoading(true);

    try {
      const ambientePayload = { ...nuevoAmbiente };
      const ambienteRes = await api.post('/ambientes/', ambientePayload);
      const ambienteId = ambienteRes.data.id;

      const registroData = {
        ...formData,
        ambiente: ambienteId
      };

      const formPayload = new FormData();
      for (const key in registroData) {
        formPayload.append(key, registroData[key]);
      }
      if (imagenes[0]) formPayload.append('imagen_1', imagenes[0]);
      if (imagenes[1]) formPayload.append('imagen_2', imagenes[1]);

      
      await api.post('/registros/', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      

      setMensaje('✅ Registro creado exitosamente');

      if (shouldContinue) {
        setFormData(prev => ({
          correo_usuario: prev.correo_usuario,
          categoria_base: '',
          subcategoria_1: '',
          subcategoria_2: '',
          subcategoria_3: '',
          tipo_aire: '',
          refrigerante: '',
          clasificacion_energetica: '',
          frecuencia_uso: '',
          horas_dia: '',
          dias_mes: '',
          potencia_w: '',
          voltaje_v: '',
          corriente_a: '',
          observaciones: ''
        }));
      } else {
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      if (error.response?.data) {
        setErrores(error.response.data);
        setMensaje('❌ Error al crear registro');
      } else {
        console.error(error);
        setMensaje('❌ Error inesperado al registrar');
      }
    } finally {
      setLoading(false);
    }
  };

  const mostrarCamposAire = formData.categoria_base === 'Aire Acondicionado';
  const mostrarClasificacion = ['Aire Acondicionado', 'Electrodomésticos'].includes(formData.categoria_base);
  const subcategoriasDisponibles = categorias[formData.categoria_base] || [];
  const usarSelectSubcategoria = subcategoriasDisponibles.length > 0;

  return (
    <div className="registro-form">
      <h2>Nuevo Registro Energético</h2>

      {mensaje && <div className={`alert ${mensaje.includes('✅') ? 'success' : 'error'}`}>{mensaje}</div>}

      <form onSubmit={(e) => handleSubmit(e, false)}>
        {/* Responsable */}
        <div className="form-section">
          <h3>Datos del Responsable</h3>
          <label>
            Correo del Responsable:
            <input
              type="email"
              name="correo_usuario"
              value={formData.correo_usuario}
              onChange={handleChange}
              required
            />
          </label>
          {errores.correo_usuario && <p className="error">{errores.correo_usuario}</p>}
        </div>

        {/* Ambiente */}
        <div className="form-section">
          <h3>Datos del Ambiente</h3>
          <label>
            Sede*:
            <input type="text" name="sede" value={nuevoAmbiente.sede} onChange={handleNuevoAmbienteChange} required />
          </label>

          <div className="form-row">
            <label>
              Bloque*:
              <input type="text" name="bloque" value={nuevoAmbiente.bloque} onChange={handleNuevoAmbienteChange} required />
            </label>
            <label>
              Piso*:
              <input type="text" name="piso" value={nuevoAmbiente.piso} onChange={handleNuevoAmbienteChange} required />
            </label>
          </div>

          <div className="form-row">
            <label>
              Tipo de Ambiente*:
              <input type="text" name="tipo_ambiente" value={nuevoAmbiente.tipo_ambiente} onChange={handleNuevoAmbienteChange} required />
            </label>
            <label>
              Nombre*:
              <input type="text" name="nombre" value={nuevoAmbiente.nombre} onChange={handleNuevoAmbienteChange} required />
            </label>
          </div>
        </div>

        {/* Equipo */}
        <div className="form-section">
          <h3>Datos del Equipo</h3>
          <label>
            Categoría Base*:
            <select name="categoria_base" value={formData.categoria_base} onChange={handleChange} required>
              <option value="">Seleccione...</option>
              {Object.keys(categorias).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>

          {mostrarCamposAire && (
            <div className="form-row">
              <label>
                Tipo de Aire*:
                <select name="tipo_aire" value={formData.tipo_aire} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  {opcionesTipoAire.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>

              <label>
                Refrigerante*:
                <select name="refrigerante" value={formData.refrigerante} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  {opcionesRefrigerante.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {mostrarClasificacion && (
            <label>
              Clasificación Energética*:
              <select name="clasificacion_energetica" value={formData.clasificacion_energetica} onChange={handleChange} required>
                <option value="">Seleccione...</option>
                {opcionesClasificacion.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
          )}

          <div className="form-row">
            <label>
              Subcategoría 1*:
              {usarSelectSubcategoria ? (
                <select name="subcategoria_1" value={formData.subcategoria_1} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  {subcategoriasDisponibles.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              ) : (
                <input type="text" name="subcategoria_1" value={formData.subcategoria_1} onChange={handleChange} required />
              )}
            </label>

            <label>
              Subcategoría 2:
              <input type="text" name="subcategoria_2" value={formData.subcategoria_2} onChange={handleChange} />
            </label>

            <label>
              Subcategoría 3:
              <input type="text" name="subcategoria_3" value={formData.subcategoria_3} onChange={handleChange} />
            </label>
          </div>
        </div>

        {/* Consumo */}
        <div className="form-section">
          <h3>Datos de Consumo</h3>
          <div className="form-row">
            <label>
              Frecuencia de Uso*:
              <input type="text" name="frecuencia_uso" value={formData.frecuencia_uso} onChange={handleChange} required />
            </label>

            <label>
              Horas/Día*:
              <input type="number" name="horas_dia" min="0" max="24" value={formData.horas_dia} onChange={handleChange} required />
            </label>

            <label>
              Días/Mes*:
              <input type="number" name="dias_mes" min="0" max="31" value={formData.dias_mes} onChange={handleChange} required />
            </label>
          </div>

          <div className="form-row">
            <label>
              Potencia (W)*:
              <input type="number" name="potencia_w" min="0" step="0.01" value={formData.potencia_w} onChange={handleChange} required />
            </label>

            <label>
              Voltaje (V):
              <input type="number" name="voltaje_v" step="0.1" value={formData.voltaje_v} onChange={handleChange} />
            </label>

            <label>
              Corriente (A):
              <input type="number" name="corriente_a" step="0.01" value={formData.corriente_a} onChange={handleChange} />
            </label>
          </div>

          <label>
            Observaciones:
            <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows="3" />
          </label>
        </div>


        <div className="form-section">
            <h3>Imágenes del Equipo (opcional)</h3>

            <label>
              Imagen 1:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagenes([e.target.files[0], imagenes[1]])}
              />
            </label>

            <label>
              Imagen 2:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagenes([imagenes[0], e.target.files[0]])}
              />
            </label>
          </div>


        <div className="form-actions">
          <button type="submit" className="btn blue" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Registro'}
          </button>

          <button type="button" className="btn green" onClick={(e) => handleSubmit(e, true)} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar y Continuar'}
          </button>

          <button type="button" className="btn gray" onClick={() => navigate('/registros')} disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoRegistro;
