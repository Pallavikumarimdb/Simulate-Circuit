'use client';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, FolderOpen, Clock, Star, MoreHorizontal, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';

const projects = [
  {
    id: 1,
    title: 'Temperature Monitor',
    description: 'Arduino-based temperature and humidity monitoring system',
    lastUpdated: '2 hours ago',
    favorite: true,
  },
  {
    id: 2,
    title: 'Smart LED Controller',
    description: 'ESP32 project for controlling addressable LED strips',
    lastUpdated: '1 day ago',
    favorite: false,
  },
  {
    id: 3,
    title: 'Soil Moisture Sensor',
    description: 'Automated plant watering system with moisture detection',
    lastUpdated: '3 days ago',
    favorite: true,
  },
  {
    id: 4,
    title: 'IoT Weather Station',
    description: 'Connected weather monitoring with cloud data upload',
    lastUpdated: '1 week ago',
    favorite: false,
  },
];

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'favorites') {
      return matchesSearch && project.favorite;
    }
    
    return matchesSearch;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
          <p className="text-muted-foreground">Manage and create embedded projects</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm rounded-md transition-all ${
                activeTab === 'all' 
                  ? 'bg-white shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Projects
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 text-sm rounded-md transition-all ${
                activeTab === 'favorites' 
                  ? 'bg-white shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Favorites
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64 rounded-full"
            />
          </div>
        </div>
      </div>
      
      <motion.div 
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card className="border-dashed border-2 h-full flex flex-col items-center justify-center p-6 bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
            <Plus className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium">Create New Project</p>
          </Card>
        </motion.div>
        
        {filteredProjects.map((project) => (
          <motion.div key={project.id} variants={item}>
            <Card className="h-full hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <button>
                    <Star className={`h-5 w-5 ${project.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{project.description}</p>
                <div className="flex items-center mt-4 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Updated {project.lastUpdated}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <FolderOpen className="h-4 w-4 mr-1" />
                  Open
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Dashboard;
