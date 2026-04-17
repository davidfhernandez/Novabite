import { ProductoPayload } from "@/types";

export const initialProducts: ProductoPayload[] = [
  {
    nombre: "Hamburguesa Andrómeda",
    descripcion: "Carne premium, queso cheddar ahumado y cebolla crispy.",
    descripcionLarga:
      "Una hamburguesa robusta con pan brioche, salsa Nova, vegetales frescos y un acabado ahumado pensado para delivery de alto nivel.",
    precio: 32000,
    categoria: "hamburguesas",
    imagenes: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&h=900&fit=crop",
    ],
    rating: 4.9,
    ingredientes: ["Carne angus", "Cheddar", "Pan brioche", "Pepinillos", "Salsa Nova"],
    destacado: true,
    stock: 12,
    disponible: true,
    etiquetas: ["Más pedido", "Signature"],
    personalizaciones: [
      {
        id: "proteina",
        nombre: "Extra de proteína",
        opciones: [
          { id: "doble-carne", nombre: "Doble carne", precio: 8000 },
          { id: "tocineta", nombre: "Tocineta crocante", precio: 4000 },
        ],
      },
      {
        id: "extras",
        nombre: "Añade sabor",
        opciones: [
          { id: "aguacate", nombre: "Aguacate", precio: 3500 },
          { id: "queso", nombre: "Queso extra", precio: 3000 },
        ],
      },
    ],
  },
  {
    nombre: 'Roll Eclipse',
    descripcion: "Salmón, aguacate y topping flambeado con salsa teriyaki.",
    descripcionLarga:
      "Sushi balanceado y visualmente potente, terminado con toques cítricos y semillas tostadas para una experiencia sofisticada.",
    precio: 36000,
    categoria: "sushi",
    imagenes: [
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200&h=900&fit=crop",
    ],
    rating: 4.8,
    ingredientes: ["Salmón", "Aguacate", "Arroz de sushi", "Teriyaki", "Sésamo"],
    destacado: true,
    stock: 8,
    disponible: true,
    etiquetas: ["Chef choice"],
    personalizaciones: [
      {
        id: "salsas",
        nombre: "Elige tu salsa",
        opciones: [
          { id: "soya-dulce", nombre: "Soya dulce", precio: 0 },
          { id: "spicy-mayo", nombre: "Spicy mayo", precio: 1500 },
        ],
      },
    ],
  },
  {
    nombre: "Bowl Nebulosa Verde",
    descripcion: "Base de quinoa, vegetales asados, hummus y proteína vegetal.",
    descripcionLarga:
      "Una propuesta vegana contundente con colores vivos, grasas saludables y toppings crocantes para mantener textura hasta el último bocado.",
    precio: 28000,
    categoria: "vegano",
    imagenes: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=900&fit=crop",
    ],
    rating: 4.7,
    ingredientes: ["Quinoa", "Falafel", "Vegetales asados", "Hummus", "Semillas"],
    destacado: true,
    stock: 5,
    disponible: true,
    etiquetas: ["Bajo stock"],
    personalizaciones: [
      {
        id: "base",
        nombre: "Mejora tu bowl",
        opciones: [
          { id: "tofu", nombre: "Tofu glaseado", precio: 4000 },
          { id: "guacamole", nombre: "Guacamole", precio: 3000 },
        ],
      },
    ],
  },
  {
    nombre: "Soda Photon",
    descripcion: "Bebida artesanal de frutos rojos con gas y espuma cítrica.",
    descripcionLarga:
      "Refresco brillante con perfil ácido-dulce, ideal para acompañar la línea premium de hamburguesas y sushi.",
    precio: 12000,
    categoria: "bebidas",
    imagenes: [
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&h=900&fit=crop",
    ],
    rating: 4.6,
    ingredientes: ["Frutos rojos", "Agua carbonatada", "Lima", "Espuma cítrica"],
    destacado: false,
    stock: 18,
    disponible: true,
    etiquetas: ["Nuevo"],
    personalizaciones: [
      {
        id: "tamano",
        nombre: "Tamaño",
        opciones: [
          { id: "mediana", nombre: "Mediana", precio: 0 },
          { id: "grande", nombre: "Grande", precio: 3000 },
        ],
      },
    ],
  },
  {
    nombre: "Burger Aurora Trufada",
    descripcion: "Doble smash burger con salsa de trufa y cebolla caramelizada.",
    descripcionLarga:
      "Una bomba de sabor con textura intensa, papas rústicas y una salsa exclusiva que la hace protagonista de la carta.",
    precio: 39000,
    categoria: "hamburguesas",
    imagenes: [
      "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=1200&h=900&fit=crop",
    ],
    rating: 4.9,
    ingredientes: ["Blend de res", "Trufa", "Cebolla caramelizada", "Queso suizo"],
    destacado: false,
    stock: 7,
    disponible: true,
    etiquetas: ["Top seller"],
    personalizaciones: [],
  },
  {
    nombre: "Set Maki Polaris",
    descripcion: "12 bocados mixtos con camarón tempura y mango.",
    descripcionLarga:
      "Roll vibrante que mezcla textura crocante, notas dulces y una base fresca. Ideal para compartir o pedir como combo central.",
    precio: 34000,
    categoria: "sushi",
    imagenes: [
      "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1200&h=900&fit=crop",
    ],
    rating: 4.7,
    ingredientes: ["Camarón tempura", "Mango", "Pepino", "Arroz de sushi"],
    destacado: false,
    stock: 15,
    disponible: true,
    etiquetas: ["Fresh pick"],
    personalizaciones: [],
  },
];
