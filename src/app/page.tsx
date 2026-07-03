import PageWrapper from '@/components/layout/PageWrapper';
import Hero from '@/components/home/Hero';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import TrendingProducts from '@/components/home/TrendingProducts';
import WhyChooseYara from '@/components/home/WhyChooseYara';
import FashionInspiration from '@/components/home/FashionInspiration';
import Testimonials from '@/components/home/Testimonials';
import InstagramShowcase from '@/components/home/InstagramShowcase';

export default function HomePage() {
  return (
    <PageWrapper>
      <Hero />
      <FeaturedCollections />
      <TrendingProducts />
      <WhyChooseYara />
      <FashionInspiration />
      <Testimonials />
      <InstagramShowcase />
    </PageWrapper>
  );
}
