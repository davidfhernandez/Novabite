import mongoose, { Model, Schema } from "mongoose";

interface CustomerDocument {
  nombre: string;
  correo: string;
  telefono: string;
  tipoDocumento: "CC" | "NIT" | "CE";
  numeroDocumento: string;
  direccion: string;
  ciudad: string;
  referencia?: string;
  pedidos: mongoose.Types.ObjectId[];
  totalPedidos: number;
  totalGastado: number;
  puntosDisponibles: number;
  puntosHistoricos: number;
  ultimoPedidoAt?: Date;
}

const customerSchema = new Schema<CustomerDocument>(
  {
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    tipoDocumento: {
      type: String,
      required: true,
      enum: ["CC", "NIT", "CE"],
    },
    numeroDocumento: { type: String, required: true, trim: true },
    direccion: { type: String, required: true, trim: true },
    ciudad: { type: String, required: true, trim: true },
    referencia: { type: String, trim: true },
    pedidos: [{ type: Schema.Types.ObjectId, ref: "Order", default: [] }],
    totalPedidos: { type: Number, default: 0 },
    totalGastado: { type: Number, default: 0 },
    puntosDisponibles: { type: Number, default: 0 },
    puntosHistoricos: { type: Number, default: 0 },
    ultimoPedidoAt: { type: Date },
  },
  { timestamps: true },
);

customerSchema.index({ correo: 1, numeroDocumento: 1 });

export const CustomerModel =
  (mongoose.models.Customer as Model<CustomerDocument>) ||
  mongoose.model<CustomerDocument>("Customer", customerSchema);
