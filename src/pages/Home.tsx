import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Award, Users, ThumbsUp, Flame, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { productService } from '@/services/api';
import { Product } from '@/data/products';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featured, bestselling] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getBestSellers()
        ]);

        // Make sure the data conforms to Product type
        setFeaturedProducts(featured.slice(0, 4));
        setBestSellers(bestselling.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const heroImages = [
    {
      src: "/images/manglanam.png",
      alt: "Natural spices",
      // title: "Pure and natural spices"
    },
    {
      src: "/1.png",
      alt: "Assorted premium spices",
      title: "Premium Spice Collection",
      subtitle: "Authentic flavors from around the world"
    },
    {
      src: "/2.png",
      alt: "Exotic spice blend",
      title: "Exotic Spice Blends",
      subtitle: "Discover unique flavor combinations"
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="relative h-[500px] md:h-[600px] w-full">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h2 className="text-3xl md:text-5xl font-playfair font-bold mb-4">{image.title}</h2>
                  <p className="text-xl md:text-2xl">{image.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 md:h-3 md:w-3 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Heading Section */}
      {/* <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="md:w-2/3  text-center flex flex-col items-left">
            <span className="inline-block text-primary font-medium mb-2">Premium Spice Collection</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold leading-tight mb-4">
              Authentic Spices,<br />
              <span className="text-primary">Extraordinary Flavors</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Discover our premium spices sourced directly from farms around the world.
              Transform your cooking with the finest ingredients nature has to offer.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" rounded="full" variant="cardamom" asChild>
                <Link to="/products">Shop Now</Link>
              </Button>
              <Button size="lg" rounded="full" variant="outline" asChild>
                <Link to="/about">Our Story</Link>
              </Button>
              <img src="./images/yash.jpg" alt="Yash Jain" className="w-20px h-18px rounded-full" />
            </div>
          </div>
        </div>
      </section> */}


      <section className="relative py-32 mt-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
                Discover the world premium spices at{" "}
                <span className="text-spice-500">Manglanam Naturals </span>
              </h1>
              <p className="text-lg text-cardamom font-bold mb-8 max-w-lg mx-auto lg:mx-0">
                “I Bilive in Real Flavor - No Artificial Flavors, No Preservatives, No Additives. Crafted with love and care, inspired by heritage from my home to yours.”
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild className="btn-primary">
                  <Link to="/shop">Shop Collection</Link>
                </Button>
                <Button asChild variant="outline" className="btn-secondary">
                  <Link to="/about">Our Story</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="./images/yash.jpg"
                alt="Assorted spices"
                className="rounded-full shadow-lg h-25"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-md hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="bg-spice-50 p-2 rounded-full">
                    <CheckCircle className="h-6 w-6 text-spice-500" />
                  </div>
                  <div>
                    <p className="flex font-bold text-2xl">Yashraj Jain</p>
                    <p className="text-sm text-gray font-bold">Founder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom wide-container">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-playfair font-bold">Best Selling Combos</h2>
              <p className="text-gray-600 mt-2">Our most popular spice combinations</p>
            </div>
            <Link to="/products" className="text-primary flex items-center font-medium hover:underline">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
              ))
            ) : (
              bestSellers.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-16 bg-white">
        <div className="container-custom wide-container">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-playfair font-bold">Featured Collection</h2>
              <p className="text-gray-600 mt-2">Discover our selection of premium spices</p>
            </div>
            <Link to="/products" className="text-primary flex items-center font-medium hover:underline">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {loading ? (
                Array(4).fill(0).map((_, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                    <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
                  </CarouselItem>
                ))
              ) : (
                featuredProducts.map((product) => (
                  <CarouselItem key={product._id || product.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                    <ProductCard product={product} />
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            <div className="hidden md:flex">
              <CarouselPrevious className="relative -left-4" />
              <CarouselNext className="relative -right-4" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50 border-t">
        <div className="container-custom">
          <h2 className="text-3xl font-playfair font-bold text-center mb-10">Why Customers Trust Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Trust Cards */}
            <Card className="p-6 text-center flex flex-col items-center hover-scale">
              <Flame className="h-10 w-10 text-primary mb-4" />

              <h3 className="font-semibold mb-2">Freshness Focusc</h3>
              <p className="text-sm text-gray-600">Our spices are small-batch processed to preserve freshness, aroma, and potent flavors in every jar.</p>
            </Card>

            <Card className="p-6 text-center flex flex-col items-center hover-scale">
              <ShieldCheck className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Farm Sourced</h3>
              <p className="text-sm text-gray-600">Directly from farm to your kitchen</p>
            </Card>

            <Card className="p-6 text-center flex flex-col items-center hover-scale">
              <img src="/images/FSSAI.svg" alt="Freshness" className="h-25 w-20 mb-4" />
              <h3 className="font-semibold mb-2">Aproved by FSSAI</h3>
              <p className="text-sm text-gray-600">Certified authentic and tested for quality</p>
            </Card>

            <Card className="p-6 text-center flex flex-col items-center hover-scale">
              <img src="/images/pepper.svg" alt="Rating" className="h-10 w-10 mb-4" />
              <h3 className="font-semibold mb-2">High Grade Spices Pure & Unadulterated</h3>
              <p className="text-sm text-gray-600">Multiple awards for quality and sustainability</p>
            </Card>

            <Card className="p-6 text-center flex flex-col items-center hover-scale">
              <Users className="h-10 w-10 text-turmeric mb-4" />
              <h3 className="font-semibold mb-2">1lac+ Customers</h3>
              <p className="text-sm text-gray-600">Trusted by Millions </p>
            </Card>

            <Card className="p-6 text-center flex flex-col items-center hover-scale">
              <ThumbsUp className="h-10 w-10 text-cinnamon mb-4" />
              <h3 className="font-semibold mb-2">4.9/5 Rating</h3>
              <p className="text-sm text-gray-600">Excellent reviews across platforms</p>
            </Card>

          </div>
        </div>
      </section>
      <section className="relative py-32  bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-6">
                Meet our{" "}
                <span className="text-spice-500">Quality Controller</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              With a legacy of over 80 years, our co-founder proudly carries forward a family spice business started by her grandfather. Known and trusted locally for decades, we continue to serve with the same passion, quality, and dedication..
              </p>
            </div>
            <div className="relative">
              <img
                src="./images/yash.jpg"
                alt="Rajesh Jhamer"
                className="rounded-full h-60 mx-auto shadow-lg"
              />
              <div className="absolute -bottom-1 -left-1 bg-white p-3 rounded-lg shadow-md hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="bg-spice-50  rounded-full">
                    <CheckCircle className="h-6 w-6 text-spice-500" />
                  </div>
                  <div>
                    <p className="font-bold text-xl">Rajesh Jhamer</p>
                    <p className="text-sm text-gray-500">Co-Founder & <br /> Quality Controller</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
