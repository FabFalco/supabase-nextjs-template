'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/webapp/ui/carousel';
import Image from 'next/image';

const pwaSteps = [
  {
    title: 'Open the app in Chrome',
    description: 'Use Google Chrome on your phone.',
    image: '/pwa/qrcode_meetingreportai.png',
    //image: '/pwa/step-1-open-chrome.jpg',
  },
  {
    title: 'Add to home screen',
    description: 'Tap the ⋮ menu in the top right corner and tap “Add to Home screen”.',
    image: '/pwa/step-2-menu.jpg',
  },
  {
    title: 'Enjoy the full app experience',
    description: 'Launch the app like a native application 🚀',
    image: '/pwa/step-4-done.jpg',
  },
  {
    title: 'Enjoy on your desktop too',
    description: 'Tap the ⋮ menu in the top right corner and tap “Install the page as an application”.',
    image: '/pwa/step-5-desktop.png',
  },
];

export default function PWAInstallCarousel() {
  return (
    <section id="installme" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Install the app
          </h2>
          <p className="text-gray-600 mt-2">
            Use it like a real mobile or desktop app — Full screen & Launcher icon
          </p>
        </div>

        <div className="relative">
          <Carousel opts={{ loop: false }}>
            <CarouselContent>
              {pwaSteps.map((step, index) => (
                <CarouselItem key={index}>
                  <div className="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-8 border">
                    
                    {/* Text */}
                    <div>
                      <span className="text-sm font-medium text-primary">
                        Step {index + 1}
                      </span>
                      <h3 className="text-2xl font-semibold mt-2 text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mt-4">
                        {step.description}
                      </p>
                    </div>

                    {/* Image */}
                    <div className="relative w-full h-[300px] rounded-lg overflow-hidden bg-white border">
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-contain"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
