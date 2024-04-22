import Feature from "../hero/Feature";
import Footer from "../hero/Footer";
import Hero from "../hero/Hero";

export const Principal = () => {
  return (
    <>
      <div className="w-screen">
        <Hero />
        <Feature />
        <Footer />
      </div>
    </>
  );
};
