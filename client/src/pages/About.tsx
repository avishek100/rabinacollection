import aboutStory from "@/assets/about-story.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => (
  <main className="pt-20 sm:pt-24">
    <section className="section-padding max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-2">Our Story</p>
        <h1 className="text-3xl sm:text-4xl font-heading">About Rabina Closet</h1>
          <p className="text-muted-foreground text-sm mt-3 max-w-2xl mx-auto">
            We design every collection to make everyday dressing elegant, comfortable, and confidence-boosting.
          </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="rounded overflow-hidden">
          <img src={aboutStory} alt="Rabina Closet boutique" className="w-full h-auto object-cover" loading="lazy" width={1200} height={800} />
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-heading">Where Style Meets Soul</h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Rabina Closet was born from a simple belief — that every woman deserves to feel beautiful in what she wears, without breaking the bank. 
            What started as a small online shop has grown into a curated fashion destination loved by thousands.
          </p>
          <p className="text-muted-foreground leading-relaxed text-sm">
            We handpick every piece in our collection, focusing on quality fabrics, flattering fits, and timeless designs that transition seamlessly from day to night.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-4">
            <div>
              <p className="text-2xl font-heading">5K+</p>
              <p className="text-xs text-muted-foreground mt-1">Happy Customers</p>
            </div>
            <div>
              <p className="text-2xl font-heading">200+</p>
              <p className="text-xs text-muted-foreground mt-1">Curated Styles</p>
            </div>
            <div>
              <p className="text-2xl font-heading">3+</p>
              <p className="text-xs text-muted-foreground mt-1">Years of Love</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Mission */}
    <section className="bg-warm section-padding">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-heading mb-4">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          To empower every woman to express her unique style with affordable, high-quality fashion.
          We believe that confidence starts with how you feel in your clothes — and we're here to make that feeling accessible to everyone.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild>
            <Link to="/shop">Shop Collection</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  </main>
);

export default About;
