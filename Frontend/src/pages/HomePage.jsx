import { Link } from "react-router-dom";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-emerald-50">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-green-50"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            <div className="transform -translate-x-4 lg:-translate-x-10">
              <p className="inline-flex items-center text-emerald-700 font-medium rounded-full bg-white/70 px-3 py-1 ring-1 ring-emerald-200 mb-6">
                Reduce food waste • Help others
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight tracking-tight text-emerald-900">
                <span className="block">Share Food</span>
                <span className="block text-emerald-600 mt-1">Share Love</span>
              </h1>
              <p className="mt-6 text-lg text-emerald-900/80 max-w-xl">
                เชื่อมโยงผู้บริจาคกับผู้รับเพื่อลดขยะอาหารและช่วยเหลือผู้ยากไร้ แบ่งปันอาหารส่วนเกิน
                ให้อาหารแก่สัตว์จรจัด หรือบริจาคขยะอินทรีย์เพื่อทำปุ๋ยหมัก
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/browse" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-white font-medium shadow hover:bg-emerald-700 transition">Browse Donations</Link>
                <Link to="/donate" className="inline-flex items-center justify-center rounded-full px-5 py-3 font-medium ring-1 ring-emerald-300 text-emerald-800 bg-white/70 hover:bg-white transition">Start Donating</Link>
              </div>
            </div>

            <div className="relative transform translate-x-4 lg:translate-x-10">
              <div className="rounded-4xl overflow-hidden shadow-xl">
                <img
                  src="./src/assets/imgfoodwaste/foodwaste01.jpg"
                  alt="Food sharing"
                  className="w-full object-cover max-h-96 md:max-h-[420px]"
                />
              </div>
              <div className="absolute -z-10 inset-0 translate-x-6 translate-y-6 rounded-4xl bg-emerald-600/5 blur-2xl"></div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-semibold mb-2">Platform Features</h2>
          <p className="text-gray-500 mb-10">Built for safety, convenience, and trust</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            <Feature
              title="User Verification"
              desc="All users are verified through phone, email, or social media for safe transactions"
              icon={shieldIcon}
            />

            <Feature
              title="GPS Integration"
              desc="Easy location sharing and pickup coordination with built-in maps"
              icon={pinIcon}
            />

            <Feature
              title="Review System"
              desc="Rate and review users to build trust and transparency in the community"
              icon={starIcon}
            />

            <Feature
              title="Organization Accounts"
              desc="Special accounts for charities, schools, and community centers"
              icon={usersIcon}
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-12 px-6 text-center shadow-lg">
            <h3 className="text-3xl font-semibold mb-2">Join Our Community Today</h3>
            <p className="mb-6 text-lg text-white/90">Start making a difference by sharing food and reducing waste</p>
            <Link to="/signup" className="inline-block bg-white text-emerald-700 px-4 py-2 rounded-md font-medium shadow">Get Started</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ title, desc, icon }) {
  return (
    <div className="flex flex-col items-center text-center px-6">
      <div className="mb-4">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="h-7 w-7 text-emerald-600" viewBox="0 0 24 24" fill="none" dangerouslySetInnerHTML={{ __html: icon }} />
        </div>
      </div>
      <h4 className="font-medium mb-2 text-gray-800">{title}</h4>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

const shieldIcon = `
<path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 2l7 3v5c0 5-3 9-7 11-4-2-7-6-7-11V5l7-3z" />
`;

const pinIcon = `
<path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
<path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 2c3 0 7 3.5 7 8.5 0 5.5-5 9.5-7 11-2-1.5-7-5.5-7-11C5 5.5 9 2 12 2z" />
`;

const starIcon = `
<path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 17.3l-5.6 3 1.5-6.2L4 10.2l6.3-.5L12 4l1.7 5.7 6.3.5-4.9 3.9 1.5 6.2z" />
`;

const usersIcon = `
<path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zM6 11c1.7 0 3-1.3 3-3S7.7 5 6 5 3 6.3 3 8s1.3 3 3 3zM2 18c0-2.2 3.6-4 8-4s8 1.8 8 4v1H2v-1z" />
`;
