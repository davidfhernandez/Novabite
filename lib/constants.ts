import { CategoriaProducto } from "@/types";

export const IVA_RATE = 0.19;

export const NEGOCIO = {
  nombre: "NovaBite",
  nit: "901.234.567-8",
  telefono: "+57 300 555 0101",
  direccion: "Calle 85 #13-28, Bogotá D.C.",
  correo: "hola@novabite.co",
};

export const ADMIN_CREDENTIALS = {
  email: "admin@novabite.com",
  password: "Nova123*",
  role: "admin",
};

export const CATEGORIAS: Array<{
  id: CategoriaProducto;
  nombre: string;
  descripcion: string;
}> = [
  {
    id: "hamburguesas",
    nombre: "Hamburguesas",
    descripcion: "Cortes premium, panes artesanales y toppings al momento.",
  },
  {
    id: "sushi",
    nombre: "Sushi",
    descripcion: "Rolls frescos con contrastes intensos y acabados gourmet.",
  },
  {
    id: "vegano",
    nombre: "Vegano",
    descripcion: "Opciones verdes con proteína vegetal y mucha textura.",
  },
  {
    id: "bebidas",
    nombre: "Bebidas",
    descripcion: "Mocktails, sodas artesanales y cafés con un giro futurista.",
  },
];

export const TESTIMONIOS = [
  {
    nombre: "Valentina R.",
    cargo: "Foodie bogotana",
    comentario:
      "El checkout fue rapidísimo y la factura me llegó al instante. Se siente como una marca premium de verdad.",
  },
  {
    nombre: "Mateo G.",
    cargo: "Amante del sushi",
    comentario:
      "Los combos llegan súper bien presentados y el panel admin hace fácil seguir los pedidos.",
  },
  {
    nombre: "Laura C.",
    cargo: "Cliente frecuente",
    comentario:
      "La experiencia móvil está impecable. Pedí en menos de tres minutos mientras iba en camino a casa.",
  },
];

export const METODOS_PAGO = [
  "Tarjeta débito o crédito",
  "Nequi",
  "Daviplata",
  "Pago contra entrega",
];
