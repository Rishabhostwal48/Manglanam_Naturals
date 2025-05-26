
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-100 to-orange-200 py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-6">Our Story</h1>
            <p className="text-lg text-gray-700 mb-8">
              Bringing authentic spices from around the world to your kitchen since 2010
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Journey */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="/placeholder.svg" 
                alt="Manglanam spice farm" 
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-playfair font-bold mb-6">Our Journey</h2>
              <p className="text-gray-600  mb-4">
              Manglanam Naturals is more than just a brand — it's the fourth generation of a family's passion for spices, purity, and tradition.
              </p>
              <p className="text-gray-600  mb-4">
              Built on the rich heritage of a spice business that has been serving families for over 80 years, our journey began with our founder’s great-grandfather — a visionary who laid the foundation for a trusted name in locally sourced spices.
              </p>
              <p className="text-gray-600 mb-4">
              With each passing generation, the commitment to purity, quality, and tradition grew stronger. From grandfather to father — and now to the fourth generation — this legacy continues through Manglanam Naturals: a brand born to honor our roots while embracing a modern, natural, and health-conscious approach.
              </p>
              <p className="text-gray-600 mb-4">
              Rooted in the trust of our local community and inspired by a vision to share our heritage with the world, Manglanam Naturals blends age-old wisdom with today’s values of wellness, sustainability, and authenticity.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-playfair font-bold mb-4">Our Values</h2>
            <p className="text-gray-700">
              The principles that guide everything we do at Manglanam Naturals
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Authenticity</h3>
              <p className="text-gray-600 text-center">
                We never compromise on the authenticity of our spices, ensuring each product delivers the true flavor profile of its origin.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="h-16 w-16 rounded-full bg-turmeric/10 text-turmeric flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Sustainability</h3>
              <p className="text-gray-600 text-center">
                We partner with farmers who employ sustainable growing practices, ensuring our spices are good for both people and the planet.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="h-16 w-16 rounded-full bg-cardamom/10 text-cardamom flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Community</h3>
              <p className="text-gray-600 text-center">
                We believe in fair trade and supporting the communities that cultivate our spices, paying premium prices directly to farmers.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Team */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-playfair font-bold mb-4">Meet Our Team</h2>
            <p className="text-gray-700">
              The passionate people behind Manglanam Naturals
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: "Yashraj Jain", title: "Founder & CEO", image: "./images/yash.jpg" },
              { name: "Rajesh Jhamer", title: "Co-Founder & Quality Controller", image: "./images/rajesh.jpg" },
              { name: "Hardika Jain", title: "Digital Marketing Manager", image: "./images/hardika.jpg" },
              { name: "Rajesh Jhamer", title: "Co-Founder & Quality Controller", image: "./images/rajesh.jpg" },
            ].map((person, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 relative overflow-hidden rounded-full aspect-square w-48 mx-auto">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="font-semibold text-lg">{person.name}</h3>
                <p className="text-gray-600">{person.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-amber-100 to-orange-300 text-black py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-playfair font-bold mb-4">Experience the Difference</h2>
            <p className="text-lg mb-8">
              Discover our premium range of spices and bring authentic global flavors to your kitchen today.
            </p>
            <Button asChild size="lg" className="bg-amber-600 text-white hover:bg-cinnamon/50">
              <Link to="/products">Shop Our Collection</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
