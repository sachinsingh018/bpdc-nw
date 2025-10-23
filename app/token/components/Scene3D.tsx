'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text3D, Center } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

function RotatingCoin() {
    const meshRef = useRef<THREE.Mesh>(null);
    const [isHovered, setIsHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

            if (isHovered) {
                meshRef.current.rotation.y += 0.02;
            }
        }
    });

    return (
        <mesh
            ref={meshRef}
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
            scale={isHovered ? 1.1 : 1}
        >
            {/* Create a coin-like shape */}
            <cylinderGeometry args={[2, 2, 0.3, 32]} />
            <meshStandardMaterial
                color="#7C3AED"
                metalness={0.8}
                roughness={0.2}
                emissive="#7C3AED"
                emissiveIntensity={0.1}
            />

            {/* Add NQY text on the coin */}
            <Center>
                <Text3D
                    font="/fonts/helvetiker_regular.typeface.json"
                    size={0.8}
                    height={0.1}
                    curveSegments={12}
                    bevelEnabled
                    bevelThickness={0.02}
                    bevelSize={0.02}
                    bevelOffset={0}
                    bevelSegments={5}
                >
                    NQY
                    <meshStandardMaterial color="#22D3EE" />
                </Text3D>
            </Center>
        </mesh>
    );
}

function ParticleField() {
    const pointsRef = useRef<THREE.Points>(null);
    const { viewport } = useThree();

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.001;
            pointsRef.current.rotation.x += 0.0005;
        }
    });

    // Generate random particles
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                    count={particleCount}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="#22D3EE"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

function Scene() {
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(0, 0, 8);
        camera.lookAt(0, 0, 0);
    }, [camera]);

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.2} />
            <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                color="#7C3AED"
            />
            <pointLight
                position={[-10, -10, -5]}
                intensity={0.5}
                color="#22D3EE"
            />

            {/* Main coin */}
            <RotatingCoin />

            {/* Particle field */}
            <ParticleField />

            {/* Stars background */}
            <Stars
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />

            {/* Fog for depth */}
            <fog attach="fog" args={['#0B0B10', 10, 100]} />
        </>
    );
}

export default function Scene3D() {
    const [isReducedMotion, setIsReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setIsReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    if (isReducedMotion) {
        return (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-cyan-900/20 to-amber-900/20">
                <div className="absolute inset-0 opacity-30">
                    <div className="w-full h-full" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }} />
                </div>
            </div>
        );
    }

    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 75 }}
            style={{ background: 'transparent' }}
            gl={{
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
            }}
            dpr={[1, 2]}
            performance={{ min: 0.5 }}
        >
            <Scene />
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                enableRotate={false}
                autoRotate
                autoRotateSpeed={0.5}
            />
        </Canvas>
    );
}
