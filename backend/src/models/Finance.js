const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  profissionalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment' 
  },
  valor: { 
    type: Number, 
    required: true 
  },
  tipo: { 
    type: String, 
    enum: ['receita', 'despesa'], 
    default: 'receita' 
  },
  descricao: String,
  data: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('Finance', financeSchema);