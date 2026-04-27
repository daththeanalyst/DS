import { useEffect } from 'react';
import '@/App.css';
import CustomCursor from '@/components/CustomCursor';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';
import ScrollProgress from '@/components/ScrollProgress';
import PageLoader from '@/components/PageLoader';
import IntroHero from '@/components/IntroHero';
import VariantNavRail from '@/components/VariantNavRail';
import LabFooter from '@/components/LabFooter';
import V01Particles from '@/components/variants/V01Particles';
import V02MagneticGrid from '@/components/variants/V02MagneticGrid';
import V03LiquidRipple from '@/components/variants/V03LiquidRipple';
import V04Shards from '@/components/variants/V04Shards';
import V05Voxels from '@/components/variants/V05Voxels';
import V06Smoke from '@/components/variants/V06Smoke';
import V07FisheyeDots from '@/components/variants/V07FisheyeDots';
import V08EchoTrail from '@/components/variants/V08EchoTrail';
import V09RGBGlitch from '@/components/variants/V09RGBGlitch';
import V10ASCII from '@/components/variants/V10ASCII';
import V11FluidSmear from '@/components/variants/V11FluidSmear';
import V12MarqueeMask from '@/components/variants/V12MarqueeMask';
import V13MagneticField from '@/components/variants/V13MagneticField';
import V14HoloCard from '@/components/variants/V14HoloCard';
import V15VerletMesh from '@/components/variants/V15VerletMesh';
import V16LiquidGlass from '@/components/variants/V16LiquidGlass';
import V17GravityOrbits from '@/components/variants/V17GravityOrbits';
import V18DepthDiorama from '@/components/variants/V18DepthDiorama';
import V19SpectrumBars from '@/components/variants/V19SpectrumBars';
import V20NeonRain from '@/components/variants/V20NeonRain';

function App() {
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
    }, []);

    return (
        <div className="App relative bg-background text-foreground grain min-h-screen">
            <PageLoader />
            <CustomCursor />
            <AnimatedBackground />
            <ScrollProgress />
            <Navbar />
            <VariantNavRail />
            <main className="relative z-10">
                <IntroHero />
                <V01Particles />
                <V02MagneticGrid />
                <V03LiquidRipple />
                <V04Shards />
                <V05Voxels />
                <V06Smoke />
                <V07FisheyeDots />
                <V08EchoTrail />
                <V09RGBGlitch />
                <V10ASCII />
                <V11FluidSmear />
                <V12MarqueeMask />
                <V13MagneticField />
                <V14HoloCard />
                <V15VerletMesh />
                <V16LiquidGlass />
                <V17GravityOrbits />
                <V18DepthDiorama />
                <V19SpectrumBars />
                <V20NeonRain />
                <LabFooter />
            </main>
        </div>
    );
}

export default App;
