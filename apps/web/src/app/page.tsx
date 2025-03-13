import { Metadata } from 'next';
import Index from '../pages/Index';



export const metadata: Metadata = {
  title: 'Web - Turborepo Example',
};

export default function Home() {
  return (
    <div className="  ">
      <main className="">
       <Index/>
      </main>
    </div>
  );
}
