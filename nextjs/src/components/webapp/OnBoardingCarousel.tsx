'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/webapp/ui/carousel';
import Image from 'next/image';

const onboardingSteps = [
    {
      title: 'Create a Meeting',
      description: 'Start by creating a meeting to track tasks and progress.',
      image: '/onboarding/meeting.png',
    },
    {
      title: 'Organize Tasks in Kanban',
      description: 'Visualize what is done, in progress, or blocked.',
      image: '/onboarding/kanban.png',
    },
    {
      title: 'Set AI Context',
      description: 'Define the tone and context once for your reports.',
      image: '/onboarding/ai-settings.png',
    },
    {
      title: 'Generate or Copy Report',
      description: 'Copy to ChatGPT or generate reports instantly.',
      image: '/onboarding/report.png',
    },
  ];

export default function OnBoardingCarousel() {
    return (
    <section id="onboarding" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
            How it works
            </h2>
            <p className="text-gray-600 mt-2">
            From meeting to clear report in minutes.
            </p>
        </div>

        <div className="relative">
            <Carousel opts={{ loop: false }}>
            <CarouselContent>
                {onboardingSteps.map((step, index) => (
                <CarouselItem key={index}>
                    <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-xl shadow-sm p-8">
                    
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
                    <div className="relative w-full h-[280px] rounded-lg overflow-hidden border">
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