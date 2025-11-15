import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function AddToCartButton({ product, className = "", showQuantity = true }) {
  const { addToCart, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (product.stock < quantity) {
      alert("No hay suficiente stock disponible");
      return;
    }

    addToCart(product, quantity);
    setAdded(true);
    
    // Mostrar feedback visual
    setTimeout(() => setAdded(false), 2000);
    
    // Opcionalmente abrir el carrito
    setTimeout(() => openCart(), 300);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Si no hay stock
  if (product.stock === 0) {
    return (
      <button
        disabled
        className={`bg-gray-400 text-white cursor-not-allowed ${className}`}
      >
        <i className="fa-solid fa-times mr-2"></i>
        Sin Stock
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selector de cantidad */}
      {showQuantity && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Cantidad:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decrementQuantity}
              className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center"
            >
              <i className="fa-solid fa-minus text-sm"></i>
            </button>
            <span className="w-16 text-center font-bold text-lg">{quantity}</span>
            <button
              type="button"
              onClick={incrementQuantity}
              disabled={quantity >= product.stock}
              className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-plus text-sm"></i>
            </button>
          </div>
          <span className="text-sm text-gray-600">
            ({product.stock} disponibles)
          </span>
        </div>
      )}

      {/* Botón agregar al carrito */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={added}
        className={`relative overflow-hidden transition-all duration-300 ${
          added
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        } ${className}`}
      >
        {added ? (
          <>
            <i className="fa-solid fa-check mr-2"></i>
            ¡Agregado al Carrito!
          </>
        ) : (
          <>
            <i className="fa-solid fa-cart-plus mr-2"></i>
            Agregar al Carrito
          </>
        )}
      </button>
    </div>
  );
}
