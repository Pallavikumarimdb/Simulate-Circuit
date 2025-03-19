import { Metadata } from 'next';
import Index from '../pages/Index';



export const metadata: Metadata = {
  title: 'Web - Turborepo Example',
};

export default function Home() {
  return (
    <div className="  ">
      <main className="">
      <div
        className="top-0 left-0 z-[10] absolute w-full h-[200px] rotate-[180deg]"
        style={{
          maskImage: "linear-gradient(transparent, black 85%)",
          backgroundColor: "#a6c2ff",
        }}
      />
       <Index/>
      </main>
    </div>
  );
}
