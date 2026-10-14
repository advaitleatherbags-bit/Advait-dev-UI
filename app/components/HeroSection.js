export default function HeroSection() {
  return (
    <section>
      {/* eslint-disable-next-line @next/next/no-img-element -- this is a user-replaceable asset in public/. */}
      <img
        src="/images/hero/main_image.png"
        alt="Premium leather bags"
        className="block h-auto w-full"
      />
    </section>
  )
}
