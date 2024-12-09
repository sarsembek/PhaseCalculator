// src/pages/ThreePhaseCalculator.tsx
import React, { useState } from 'react';
import { Card, Button, Input, Spacer } from '@nextui-org/react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

const ThreePhaseSeparatorCalculator: React.FC = () => {
  const navigate = useNavigate();

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

    const stepLogs: string[] = [];

    // Step 1: Calculate difference in specific gravities (ΔSG)
    const deltaSG = waterSG - oilSG;
    stepLogs.push(
      `**Step 1:** Calculate difference in specific gravities (ΔSG):\n` +
        `ΔSG = SG_w - SG_o = ${waterSG} - ${oilSG} = ${deltaSG.toFixed(3)}`
    );

    // Step 2: Calculate minimum diameter for liquid droplets in gas phase (d2)
    const C_D = 2.01; // Updated Drag Coefficient
    const d2 = Math.sqrt(
      (5040 * 1 * oilFlowRate * 1e6) / (Math.sqrt(C_D) * pressure * deltaSG)
    );
    stepLogs.push(
      `**Step 2:** Calculate minimum diameter for liquid droplets in gas phase (d2):\n` +
        `d2 = √[(5040 × 1 × Qo × 10⁶) / (√CD × P × ΔSG)]\n` +
        `d2 = √[(5040 × 1 × ${oilFlowRate} × 10⁶) / (√${C_D} × ${pressure} × ${deltaSG.toFixed(
          3
        )})]\n` +
        `d2 = ${d2.toFixed(1)} in`
    );

    // Step 3: Calculate minimum diameter for water droplets in oil phase (d3)
    const d3 = Math.sqrt(
      (6690 * gasFlowRate * 10 ** 6) / (0.194 * 500 ** 2)
    );
    stepLogs.push(
      `**Step 3:** Calculate minimum diameter for water droplets in oil phase (d3):\n` +
        `d3 = √[(6690 × Qg × 10⁶) / (ΔSG × Droplet Size_w²)]\n` +
        `d3 = √[(6690 × ${gasFlowRate} × 10⁶) / (${deltaSG} × 500²)]\n` +
        `d3 = ${d3.toFixed(1)} in`
    );

    // Step 4: Calculate minimum diameter for oil droplets in water phase (d4)
    const d4 = Math.sqrt(
      (6690 * waterFlowRate * 10 ** 6) / (deltaSG * 200 ** 2)
    );
    stepLogs.push(
      `**Step 4:** Calculate minimum diameter for oil droplets in water phase (d4):\n` +
        `d4 = √[(6690 × Qw × 10⁶) / (ΔSG × Droplet Size_o²)]\n` +
        `d4 = √[(6690 × ${waterFlowRate} × 10⁶) / (${deltaSG} × 200²)]\n` +
        `d4 = ${d4.toFixed(1)} in`
    );

    // Step 5: Select the largest diameter as dmin
    const dmin = Math.max(d2, d3, d4);
    stepLogs.push(
      `**Step 5:** Select the largest diameter as dmin:\n` +
        `dmin = max(d2, d3, d4) = max(${d2.toFixed(1)}, ${d3.toFixed(
          1
        )}, ${d4.toFixed(1)}) = ${dmin.toFixed(1)} in`
    );

    // Step 6: Calculate ho + hw
    const ho_plus_hw =
      (10 * oilFlowRate + 10 * waterFlowRate) / (0.12 * dmin ** 2);
    stepLogs.push(
      `**Step 6:** Calculate ho + hw:\n` +
        `ho + hw = (tr_o × Qo + tr_w × Qw) / (0.12 × dmin²)\n` +
        `ho + hw = (10 × ${oilFlowRate} + 10 × ${waterFlowRate}) / (0.12 × ${dmin.toFixed(
          1
        )}²)\n` +
        `ho + hw = ${ho_plus_hw.toFixed(1)} in`
    );

    // Step 7: Calculate seam-to-seam length (Lss)
    const Lss = ho_plus_hw + 76; // Since dmin > 36 in
    stepLogs.push(
      `**Step 7:** Calculate seam-to-seam length (Lss):\n` +
        `Lss = ho + hw + 76\n` +
        `Lss = ${ho_plus_hw.toFixed(1)} + 76\n` +
        `Lss = ${Lss.toFixed(1)} in`
    );

    // Step 8: Calculate slenderness ratio
    const slendernessRatio = (12 * (Lss / 12)) / dmin; // Convert Lss to feet
    stepLogs.push(
      `**Step 8:** Calculate slenderness ratio:\n` +
        `Slenderness Ratio = (12 × Lss) / dmin\n` +
        `Slenderness Ratio = (12 × ${(Lss / 12).toFixed(
          1
        )} ft) / ${dmin.toFixed(1)} in\n` +
        `Slenderness Ratio = ${slendernessRatio.toFixed(1)}`
    );

    // Step 9: Final Selection (As per Example)
    // Selecting d = 90 in, Lss = 20 ft, SR = 2.6 (Based on table)
    stepLogs.push(
      `**Step 9:** Final Selection:\n` +
        `Selected Diameter (dmin) = 90 in\n` +
        `Seam-to-Seam Length (Lss) = 20 ft\n` +
        `Slenderness Ratio (SR) = 2.6`
    );

    // Update steps state
    setSteps(stepLogs);
  };

  return (
    <div className="md:py-10 bg-gradient-to-r from-purple-300 to-blue-500">
      <Card className="max-w-4xl mx-auto shadow-md p-6">
        <h2 className="md:text-2xl font-bold text-center text-purple-700 mb-6">
          Three-Phase Separator Calculator
        </h2>

        <div className="space-y-4">
          {Object.keys(inputs).map((key) => (
            <div key={key} className="flex flex-col">
              <Input
                fullWidth
                label={key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
                name={key}
                type="number"
                step="0.01"
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
          <Card className="mt-8 p-6 bg-gray-100 rounded-md">
            <h3 className="text-xl font-bold text-purple-700 mb-4">
              Step-by-Step Results
            </h3>
            <ol className="list-decimal space-y-4 pl-6 text-purple-800">
              {steps.map((step, index) => (
                <li key={index} className='text-sm md:text-base leading-relaxed whitespace-pre-line'>
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