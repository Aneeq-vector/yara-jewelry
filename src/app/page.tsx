import PageWrapper from '@/components/layout/PageWrapper';

export const revalidate = 60; // Revalidate the page every 60 seconds to pick up new PocketBase data
import Hero from '@/components/home/Hero';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import TrendingProducts from '@/components/home/TrendingProducts';
import WhyChooseYara from '@/components/home/WhyChooseYara';
import FashionInspiration from '@/components/home/FashionInspiration';
import Testimonials from '@/components/home/Testimonials';
import InstagramShowcase from '@/components/home/InstagramShowcase';
import { getTrendingProducts } from '@/lib/data/products';
import { getAllCategories } from '@/lib/data/categories';
import { getAllTestimonials } from '@/lib/data/testimonials';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const [trendingProducts, categories, testimonials] = await Promise.all([
    getTrendingProducts(),
    getAllCategories(),
    getAllTestimonials(),
  ]);

  return (
    <PageWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Yara Jewellery",
            alternateName: "Yara",
            url: "https://yarasl.shop/",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Yara Jewellery",
            url: "https://yarasl.shop/",
            logo: "https://yarasl.shop/images/yara-logo.png",
            sameAs: [
              "https://instagram.com/yarashop_sl",
              "https://tiktok.com/@yarashop_sl",
              "https://facebook.com/yarajewelry",
            ],
          }),
        }}
      />
      <Hero />
      <FeaturedCollections categories={categories} />
      <TrendingProducts products={trendingProducts} />
      <WhyChooseYara />
      <FashionInspiration />
      <Testimonials testimonials={testimonials} />
      <InstagramShowcase />
    </PageWrapper>
  );
}
