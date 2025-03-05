import Banner from "../components/Banner";
import ProductCard from "../components/ProductCard";

const products = [
  { id: 1, name: "Serum Top White", image: "/serum.jpg", price: 240, rating: 4.5 },
  { id: 2, name: "Kem Nền", image: "/foundation.jpg", price: 120, rating: 4.6 },
];

const Home = () => {
  return (
    <div>
      <Banner />
      <section className="grid grid-cols-2 gap-4 p-4">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
};

export default Home;
