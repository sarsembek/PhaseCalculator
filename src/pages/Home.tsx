import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Spacer } from '@nextui-org/react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-300 to-blue-500">
      <Card style={{ maxWidth: "400px", padding: "24px" }} isHoverable isPressable>
        <CardBody style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 className="text-center mb-4 text-indigo-600">
          Separator Calculator
        </h2>
          
          <Button
            onClick={() => navigate('/two-phase')}
            color="primary"
            className="w-full"
          >
            Two-Phase Separator
          </Button>
          
          <Spacer y={1} />
          
          <Button
            onClick={() => navigate('/three-phase')}
            color="success"
            className="w-full"
          >
            Three-Phase Separator
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default Home;
