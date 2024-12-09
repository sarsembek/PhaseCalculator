// src/components/ThreePhaseCalculator.tsx
import React, { useState } from 'react';
import { Card, Button, Input, Spacer } from '@nextui-org/react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const ThreePhaseSeparatorCalculator: React.FC = () => {
  const navigate = useNavigate(); // Initialize navigate

  const [inputs, setInputs] = useState({
    oilFlowRate: 5000, // BOPD
    waterFlowRate: 3000, // BWPD
    gasFlowRate: 5, // MMscfd
    pressure: 100, // psia
    temperature: 90, // °F
    oilAPI: 30, // API
    oilSG: 0.876, // Specific gravity of oil
    waterSG: 1.07, // Specific gravity of water
    gasSG: 0.6, // Specific gravity of gas
    oilRetentionTime: 10, // minutes
    waterRetentionTime: 10, // minutes
    interfacialTension: 0.3, // lb/ft³
  });

  const [steps, setSteps] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: parseFloat(value) });
  };

  const calculateThreePhaseSeparator = () => {
    const {
      oilFlowRate,
      waterFlowRate,
      gasFlowRate,
      pressure,
      oilSG,
      waterSG,
    } = inputs;

    const dropletSizeGas = 100; // microns
    const dropletSizeWater = 500; // microns
    const dropletSizeOil = 200; // microns
    const deltaSGOilWater = waterSG - oilSG;

    const dLiquidInGas = Math.sqrt(
      (6690 * gasFlowRate * dropletSizeGas ** 2) / (pressure * deltaSGOilWater)
    );

    const dWaterInOil = Math.sqrt(
      (6690 * waterFlowRate * dropletSizeWater ** 2) /
        (pressure * deltaSGOilWater)
    );

    const dOilInWater = Math.sqrt(
      (6690 * oilFlowRate * dropletSizeOil ** 2) /
        (pressure * deltaSGOilWater)
    );

    const dMin = Math.max(dLiquidInGas, dWaterInOil, dOilInWater);

    const hOW =
      (inputs.oilRetentionTime * oilFlowRate +
        inputs.waterRetentionTime * waterFlowRate) /
      (0.12 * dMin ** 2);

    const Lss = hOW + 76;

    const slendernessRatio = (12 * Lss) / dMin;

    setSteps([
      `**Step 1:** Difference in specific gravities (ΔSG):\nΔSG = ${waterSG} - ${oilSG} = ${deltaSGOilWater.toFixed(3)}`,
      `**Step 2:** Minimum diameter for liquid droplets in gas phase:\nd = ${dLiquidInGas.toFixed(2)} in`,
      `**Step 3:** Minimum diameter for water droplets in oil phase:\nd = ${dWaterInOil.toFixed(2)} in`,
      `**Step 4:** Minimum diameter for oil droplets in water phase:\nd = ${dOilInWater.toFixed(2)} in`,
      `**Step 5:** Largest diameter:\ndMin = ${dMin.toFixed(2)} in`,
      `**Step 6:** Height for oil and water (hOW):\nhOW = ${hOW.toFixed(2)} in`,
      `**Step 7:** Seam-to-seam length (Lss):\nLss = ${Lss.toFixed(2)} in`,
      `**Step 8:** Slenderness ratio:\nSlenderness Ratio = ${slendernessRatio.toFixed(2)}`,
    ]);
  };

  return (
    <div className="py-10 bg-gradient-to-r from-purple-300 to-blue-500">
      <Card className="max-w-4xl mx-auto shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">
          Three-Phase Separator Calculator
        </h2>

        <div className="space-y-4">
          {Object.keys(inputs).map((key) => (
            <div key={key} className="flex flex-col">
              <Input
                fullWidth
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                name={key}
                type="number"
                value={inputs[key as keyof typeof inputs].toString()}
                onChange={handleInputChange}
                className="mb-4"
              />
            </div>
          ))}
          <Spacer y={1.5} />
          <Button
            onClick={calculateThreePhaseSeparator}
            className="w-full bg-purple-700 hover:bg-purple-600 text-white"
          >
            Calculate
          </Button>
          <Button
            onClick={() => navigate('/')} // Navigate to root page
            className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white"
          >
            Home
          </Button>
        </div>

        {steps.length > 0 && (
          <Card className="mt-8 p-6 rounded-md bg-purple-50">
            <h3 className="text-xl font-bold text-purple-700 mb-4">Step-by-Step Results</h3>
            <ol className="list-decimal space-y-4 pl-6 text-purple-800">
              {steps.map((step, index) => (
                <li key={index}>
                  <ReactMarkdown>{step}</ReactMarkdown>
                </li>
              ))}
            </ol>
          </Card>
        )}
    </Card>
   </div>
  );
};

export default ThreePhaseSeparatorCalculator;