'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Cpu, 
  Layers,
  Download
} from 'lucide-react';
import { toast } from '../components/ui/use-toast';
import { generateHardwareModel, GeneratedHardwareModel, HardwareComponent } from '../services/model-generation-service';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface HardwareVisualizationProps {
  code?: string;
  microcontroller: string;
  language: string;
}

const HardwareVisualization = ({ 
  code = '', 
  microcontroller = 'arduino-uno',
  language = 'cpp'
}: HardwareVisualizationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hardwareModel, setHardwareModel] = useState<GeneratedHardwareModel | null>(null);
  const [highlightedComponent, setHighlightedComponent] = useState<string | null>(null);

  // Initialize Three.js scene
  const initScene = () => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 15, 15);
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;
    
    // Add lighting
    addLighting(scene);
    
    // Add grid
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);
    
    // Start animation loop
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  };
  
  // Add lighting to scene
  const addLighting = (scene: THREE.Scene) => {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    // Directional light (sun)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
    
    // Point lights for better highlights
    const pointLight1 = new THREE.PointLight(0xffffff, 1, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight2.position.set(-5, 3, -5);
    scene.add(pointLight2);
  };
  
  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    
    if (controlsRef.current) {
      controlsRef.current.update();
    }
    
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };
  
  // Create 3D objects from model data
  const createHardwareObjects = (model: GeneratedHardwareModel) => {
    if (!sceneRef.current) return;
    
    // Clear existing objects
    while (sceneRef.current.children.length > 0) {
      sceneRef.current.remove(sceneRef.current.children[0]);
    }
    
    // Add lighting back
    addLighting(sceneRef.current);
    
    // Add grid back
    const gridHelper = new THREE.GridHelper(20, 20);
    sceneRef.current.add(gridHelper);
    
    // Create board
    const boardGeometry = new THREE.BoxGeometry(
      model.boardDimensions[0], 
      model.boardDimensions[1], 
      model.boardDimensions[2]
    );
    const boardMaterial = new THREE.MeshStandardMaterial({ 
      color: model.boardColor,
      roughness: 0.7,
      metalness: 0.2
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.y = model.boardDimensions[1] / 2;
    board.castShadow = true;
    board.receiveShadow = true;
    board.userData = { type: 'board', name: model.baseModel };
    sceneRef.current.add(board);
    
    // Add components
    model.components.forEach(component => {
      let mesh: THREE.Mesh;
      
      switch(component.type) {
        case 'mcu':
          mesh = createMCU(component, model.baseModel);
          break;
        case 'led':
          mesh = createLED(component);
          break;
        case 'button':
          mesh = createButton(component);
          break;
        case 'sensor':
          mesh = createSensor(component);
          break;
        case 'display':
          mesh = createDisplay(component);
          break;
        case 'connector':
          mesh = createConnector(component);
          break;
        default:
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshStandardMaterial({ color: component.color });
          mesh = new THREE.Mesh(geometry, material);
      }
      
      mesh.position.set(
        component.position[0],
        component.position[1],
        component.position[2]
      );
      
      mesh.rotation.set(
        component.rotation[0],
        component.rotation[1],
        component.rotation[2]
      );
      
      mesh.scale.set(
        component.scale[0],
        component.scale[1],
        component.scale[2]
      );
      
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Store component data for interactions
      mesh.userData = { 
        type: component.type, 
        name: component.name,
        properties: component.properties || {}
      };
      //@ts-ignore
      sceneRef.current.add(mesh);
      
      // Add label for the component
      //@ts-ignore
      addLabel(component.name, component.position, sceneRef.current);
    });
    
    // Add pin connection lines
    addPinConnections(model, sceneRef.current);
  };
  
  // Create MCU component
  const createMCU = (component: HardwareComponent, mcuType: string): THREE.Mesh => {
    let geometry: THREE.BoxGeometry;
    
    // Create different geometries based on MCU type
    switch(mcuType) {
      case 'esp32':
        geometry = new THREE.BoxGeometry(4, 0.5, 3);
        break;
      case 'stm32f4':
        geometry = new THREE.BoxGeometry(6, 0.5, 4);
        break;
      case 'arduino-uno':
      default:
        geometry = new THREE.BoxGeometry(5, 0.5, 3);
    }
    
    const material = new THREE.MeshStandardMaterial({ 
      color: component.color,
      roughness: 0.5,
      metalness: 0.6
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Add chip details
    const chipGeometry = new THREE.BoxGeometry(1.5, 0.2, 1.5);
    const chipMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const chip = new THREE.Mesh(chipGeometry, chipMaterial);
    chip.position.y = 0.3;
    mesh.add(chip);
    
    // Add connector pins
    const pinRowCount = mcuType === 'arduino-uno' ? 6 : 8;
    const pinSpacing = mcuType === 'arduino-uno' ? 0.4 : 0.3;
    
    for (let i = 0; i < pinRowCount; i++) {
      const pinGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
      const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.8 });
      
      // Left side pins
      const leftPin = new THREE.Mesh(pinGeometry, pinMaterial);
      leftPin.position.set(-geometry.parameters.width/2, 0, -geometry.parameters.depth/2 + i * pinSpacing);
      leftPin.rotation.x = Math.PI / 2;
      mesh.add(leftPin);
      
      // Right side pins
      if (i < pinRowCount) {
        const rightPin = new THREE.Mesh(pinGeometry, pinMaterial);
        rightPin.position.set(geometry.parameters.width/2, 0, -geometry.parameters.depth/2 + i * pinSpacing);
        rightPin.rotation.x = Math.PI / 2;
        mesh.add(rightPin);
      }
    }
    
    return mesh;
  };
  
  // Create LED component
  const createLED = (component: HardwareComponent): THREE.Mesh => {
    const ledBase = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const led = new THREE.Mesh(ledBase, baseMaterial);
    
    // LED dome
    const ledDome = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshStandardMaterial({ 
      color: component.color,
      transparent: true,
      opacity: 0.8,
      emissive: component.color,
      emissiveIntensity: 0.5
    });
    
    const dome = new THREE.Mesh(ledDome, domeMaterial);
    dome.position.y = 0.1;
    led.add(dome);
    
    // Add pins
    const pinGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.8 });
    
    const pin1 = new THREE.Mesh(pinGeometry, pinMaterial);
    pin1.position.set(0.2, -0.3, 0);
    led.add(pin1);
    
    const pin2 = new THREE.Mesh(pinGeometry, pinMaterial);
    pin2.position.set(-0.2, -0.3, 0);
    led.add(pin2);
    
    return led;
  };
  
  // Create Button component
  const createButton = (component: HardwareComponent): THREE.Mesh => {
    const baseGeometry = new THREE.BoxGeometry(1, 0.2, 1);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const button = new THREE.Mesh(baseGeometry, baseMaterial);
    
    // Button top
    const topGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 16);
    const topMaterial = new THREE.MeshStandardMaterial({ color: component.color });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 0.175;
    button.add(top);
    
    // Add pins
    const pinGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.8 });
    
    const pin1 = new THREE.Mesh(pinGeometry, pinMaterial);
    pin1.position.set(0.3, -0.3, 0.3);
    button.add(pin1);
    
    const pin2 = new THREE.Mesh(pinGeometry, pinMaterial);
    pin2.position.set(-0.3, -0.3, 0.3);
    button.add(pin2);
    
    const pin3 = new THREE.Mesh(pinGeometry, pinMaterial);
    pin3.position.set(0.3, -0.3, -0.3);
    button.add(pin3);
    
    const pin4 = new THREE.Mesh(pinGeometry, pinMaterial);
    pin4.position.set(-0.3, -0.3, -0.3);
    button.add(pin4);
    
    return button;
  };
  
  // Create Sensor component
  const createSensor = (component: HardwareComponent): THREE.Mesh => {
    const baseGeometry = new THREE.BoxGeometry(1.2, 0.2, 0.8);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x006064 });
    const sensor = new THREE.Mesh(baseGeometry, baseMaterial);
    
    // Sensor component
    const sensorGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
    const sensorMaterial = new THREE.MeshStandardMaterial({ color: component.color });
    const sensorElement = new THREE.Mesh(sensorGeometry, sensorMaterial);
    sensorElement.position.y = 0.15;
    sensorElement.rotation.x = Math.PI / 2;
    sensor.add(sensorElement);
    
    // Add pins
    const pinGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.8 });
    
    for (let i = 0; i < 3; i++) {
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.position.set(-0.4 + i * 0.4, -0.3, 0);
      sensor.add(pin);
    }
    
    return sensor;
  };
  
  // Create Display component
  const createDisplay = (component: HardwareComponent): THREE.Mesh => {
    const baseGeometry = new THREE.BoxGeometry(2, 0.2, 1.5);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const display = new THREE.Mesh(baseGeometry, baseMaterial);
    
    // Screen
    const screenGeometry = new THREE.BoxGeometry(1.8, 0.1, 1.2);
    const screenMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x003366,
      transparent: true,
      opacity: 0.9,
      emissive: 0x003366,
      emissiveIntensity: 0.2
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.y = 0.15;
    display.add(screen);
    
    // Add pins
    const pinGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.8 });
    
    for (let i = 0; i < 4; i++) {
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.position.set(-0.6 + i * 0.4, -0.3, -0.6);
      display.add(pin);
    }
    
    return display;
  };
  
  // Create Connector component
  const createConnector = (component: HardwareComponent): THREE.Mesh => {
    const baseGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.8);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: component.color });
    const connector = new THREE.Mesh(baseGeometry, baseMaterial);
    
    // Add pins
    const pinGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.8 });
    
    for (let i = 0; i < 2; i++) {
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.position.set(-0.2 + i * 0.4, -0.3, 0);
      connector.add(pin);
    }
    
    return connector;
  };
  
  // Add label to component
  const addLabel = (text: string, position: [number, number, number], scene: THREE.Scene) => {
    // Create dynamic canvas for text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = '24px Arial';
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create texture and sprite
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    sprite.position.set(position[0], position[1] + 1.2, position[2]);
    sprite.scale.set(2, 0.5, 1);
    
    scene.add(sprite);
  };
  
  // Add connection lines between pins and components
  const addPinConnections = (model: GeneratedHardwareModel, scene: THREE.Scene) => {
    // Find the MCU (reference point)
    const mcuComponent = model.components.find(comp => comp.type === 'mcu');
    if (!mcuComponent) return;
    
    // For each component with pin connections, draw lines to the MCU
    model.components.forEach(component => {
      if (component.type === 'mcu') return;
      if (!component.properties?.pinConnection) return;
      
      const pinConnection = component.properties.pinConnection;
      
      // Create line
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(mcuComponent.position[0], mcuComponent.position[1] + 0.5, mcuComponent.position[2]),
        new THREE.Vector3(component.position[0], component.position[1], component.position[2])
      ]);
      
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00FF00,
        linewidth: 2
      });
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.userData = { 
        type: 'connection', 
        pinNumber: pinConnection,
        source: mcuComponent.name,
        target: component.name
      };
      
      scene.add(line);
      
      // Add connection label
      const midPoint: [number, number, number] = [
        (mcuComponent.position[0] + component.position[0]) / 2,
        (mcuComponent.position[1] + component.position[1]) / 2 + 0.5,
        (mcuComponent.position[2] + component.position[2]) / 2
      ];
      
      addLabel(`PIN ${pinConnection}`, midPoint, scene);
    });
  };
  
  // Generate hardware model based on code
  const handleGenerateModel = async () => {
    if (!code) {
      toast({
        title: "No code available",
        description: "Please write or generate some code first",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const model = await generateHardwareModel(code, microcontroller, language);
      setHardwareModel(model);
      
      // Create 3D objects
      createHardwareObjects(model);
      
      toast({
        title: "Hardware model generated",
        description: `Created model for ${microcontroller} with ${model.components.length} components`,
      });
    } catch (error) {
      console.error("Error generating hardware model:", error);
      toast({
        title: "Error generating model",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Zoom controls
  const handleZoom = (zoomIn: boolean) => {
    if (!cameraRef.current) return;
    
    const zoomDelta = zoomIn ? -1 : 1;
    cameraRef.current.position.z += zoomDelta;
    cameraRef.current.position.y += zoomDelta * 0.5;
    
    // Ensure minimum distance
    if (cameraRef.current.position.z < 5) {
      cameraRef.current.position.z = 5;
      cameraRef.current.position.y = 5;
    }
    
    // Ensure maximum distance
    if (cameraRef.current.position.z > 30) {
      cameraRef.current.position.z = 30;
      cameraRef.current.position.y = 15;
    }
  };
  
  // Reset camera position
  const handleResetView = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    cameraRef.current.position.set(0, 15, 15);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };
  
  // Take screenshot
  const handleTakeScreenshot = () => {
    if (!rendererRef.current) return;
    
    // Render the scene
    if (sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    
    // Get canvas data URL
    const dataURL = rendererRef.current.domElement.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${microcontroller}-model.png`;
    link.click();
    
    toast({
      title: "Screenshot saved",
      description: `${microcontroller}-model.png has been downloaded`,
    });
  };
  
  // Component highlighter
  const highlightComponent = (componentName: string) => {
    if (!sceneRef.current) return;
    
    setHighlightedComponent(componentName);
    
    // Reset all materials
    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.name) {
        const originalColor = child.userData.originalColor;
        if (originalColor && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissive.setHex(0x000000);
        }
      }
    });
    
    // Highlight selected component
    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.name === componentName) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          // Store original color if not already stored
          if (!child.userData.originalColor) {
            child.userData.originalColor = child.material.color.getHex();
          }
          child.material.emissive.setHex(0xFF9900);
        }
      }
    });
  };
  
  // Initialize on mount
  useEffect(() => {
    initScene();
    
    // Auto-generate on mount if code is available
    if (code) {
      handleGenerateModel();
    }
    
    return () => {
      // Cleanup
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Regenerate when code changes significantly
  useEffect(() => {
    const codeChangeTimeout = setTimeout(() => {
      if (code && hardwareModel) {
        handleGenerateModel();
      }
    }, 3000);
    
    return () => clearTimeout(codeChangeTimeout);
  }, [code, microcontroller]); // eslint-disable-line react-hooks/exhaustive-deps
  
  return (
    <div className="border rounded-md shadow-sm h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="border-b p-3 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cpu className="h-5 w-5 text-blue-500" />
          <span className="font-medium">AI Hardware Visualization</span>
          {isLoading && (
            <div className="flex items-center text-amber-500 text-xs ml-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 mr-1 animate-pulse"></div>
              Generating
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateModel}
            disabled={isLoading || !code}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating...' : 'Generate Model'}
          </Button>
        </div>
      </div>
      
      <div className="flex-grow flex">
        <div className="w-3/4 relative" ref={containerRef}>
          {/* 3D Viewer will be initialized here */}
          <div className="absolute top-2 left-2 flex flex-col space-y-2">
            <Button variant="secondary" size="icon" onClick={() => handleZoom(true)}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => handleZoom(false)}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleResetView}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleTakeScreenshot}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="w-1/4 border-l overflow-y-auto p-4">
          <h3 className="font-medium text-lg mb-2">Hardware Components</h3>
          
          {hardwareModel ? (
            <div className="space-y-2">
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
                <CardContent className="p-3">
                  <h4 className="font-medium flex items-center">
                    <Cpu className="h-4 w-4 mr-1.5 text-blue-500" />
                    Base Board
                  </h4>
                  <p className="text-sm mt-1">{hardwareModel.baseModel}</p>
                </CardContent>
              </Card>
              
              {hardwareModel.components.map((component, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-colors ${
                    highlightedComponent === component.name 
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10' 
                      : ''
                  }`}
                  onClick={() => highlightComponent(component.name)}
                >
                  <CardContent className="p-3">
                    <h4 className="font-medium flex items-center">
                      {component.type === 'led' ? (
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></div>
                      ) : component.type === 'button' ? (
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></div>
                      ) : component.type === 'sensor' ? (
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-1.5"></div>
                      ) : component.type === 'display' ? (
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-1.5"></div>
                      ) : component.type === 'connector' ? (
                        <div className="w-3 h-3 rounded-full bg-gray-500 mr-1.5"></div>
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></div>
                      )}
                      {component.name}
                    </h4>
                    
                    {component.properties?.pinConnection && (
                      <p className="text-xs mt-1">
                        Connected to pin: {component.properties.pinConnection}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              <div className="mt-4">
                <h4 className="font-medium flex items-center">
                  <Layers className="h-4 w-4 mr-1.5 text-blue-500" />
                  Board Dimensions
                </h4>
                <p className="text-sm mt-1">
                  {hardwareModel.boardDimensions[0]}cm × {hardwareModel.boardDimensions[2]}cm
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <RefreshCw className="h-8 w-8 animate-spin mb-2" />
                  <p>Analyzing code and generating hardware model...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Cpu className="h-8 w-8 mb-2" />
                  <p>No hardware model generated yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleGenerateModel}
                    disabled={!code}
                  >
                    Generate Model
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HardwareVisualization;
