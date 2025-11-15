function Footer() {
  return (
    <footer className="bg-background-color/70 backdrop-blur-md border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-6 py-8 gap-4 text-text-color">
        <p className="text-xs sm:text-sm">Copyright © 2025 GLD Servicios • Todos los derechos reservados</p>
        
        <div className="flex items-center gap-6">
          <p className="hidden sm:block text-sm">Síguenos:</p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-3xl text-pink-600 hover:text-pink-800 hover:scale-125 transition-all duration-300"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              href="#"
              className="text-3xl text-indigo-600 hover:text-indigo-800 hover:scale-125 transition-all duration-300"
            >
              <i className="fa-brands fa-tiktok"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;