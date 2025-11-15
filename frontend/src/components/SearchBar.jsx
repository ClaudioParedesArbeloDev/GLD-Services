export default function SearchBar({ products, setFiltered }) {
  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setFiltered(
      products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    );
  };

  return (
    <input
      type="text"
      placeholder="Buscar producto..."
      onChange={handleSearch}
      className="w-full p-2 border rounded mb-4 shadow-sm focus:ring focus:ring-blue-300"
    />
  );
}
