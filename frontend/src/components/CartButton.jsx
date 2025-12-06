import { useCart } from "../context/CartContext";

export default function CartButton() {
  const { getTotalItems, openCart } = useCart();
  const itemCount = getTotalItems();

  return (
    <button
      onClick={openCart}
      className="relative p-3  text-black hover:text-emerald-500 transition-all duration-300 transform hover:scale-110"
      aria-label="Abrir carrito"
    >
      <i className="fa-solid fa-shopping-cart text-xl"></i>
      
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
