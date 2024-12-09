import React, { useState } from 'react';
import { Card, Button, Input, Spacer } from '@nextui-org/react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

const TwoPhaseCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    gasFlowRate: 10, // MMSCFD
    oilFlowRate: 2000, // BOPD
    pressure: 1000, // psia
    temperature: 60, // °F
    dropletSize: 140, // microns
    retentionTime: 3, // minutes
    specificGravity: 0.6, // Specific gravity of gas
    apiGravity: 40, // API gravity of oil
  });

  const [steps, setSteps] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: parseFloat(value) });
  };

  const calculateSeparator = () => {
    const {
      gasFlowRate,
      oilFlowRate,
      pressure,
      temperature,
      retentionTime,
      specificGravity,
      apiGravity,
    } = inputs;

    const stepLogs: string[] = [];

    // Step 1: Calculate Liquid Density (ρl)
    const rhoL = (141.5 / (131.5 + apiGravity)) * 62.4; // lb/ft³
    stepLogs.push(
      `**Step 1:** Calculate Liquid Density (ρl):\n` +
        `Formula: ρl = (141.5 / (131.5 + API)) × 62.4\n` +
        `Substitute: ρl = (141.5 / (131.5 + ${apiGravity})) × 62.4\n` +
        `ρl = ${rhoL.toFixed(2)} lb/ft³`
    );

    // Step 2: Calculate Gas Density (ρg)
    const tempRankine = temperature + 460; // Convert to Rankine
    const rhoG = (2.7 * specificGravity * pressure) / (0.84 * tempRankine); // lb/ft³
    stepLogs.push(
      `**Step 2:** Calculate Gas Density (ρg):\n` +
        `Formula: ρg = (2.7 × SG × P) / (0.84 × T)\n` +
        `Substitute: ρg = (2.7 × ${specificGravity} × ${pressure}) / (0.84 × (${temperature} + 460))\n` +
        `ρg = ${rhoG.toFixed(2)} lb/ft³`
    );

    // Step 3: Calculate Terminal Velocity (Vt)
    const deltaRho = rhoL - rhoG; // Difference in densities
    const CD = 0.34; // Drag coefficient
    const Vt = Math.sqrt(deltaRho / (rhoG * CD)); // ft/s
    stepLogs.push(
      `**Step 3:** Calculate Terminal Velocity (Vt):\n` +
        `Formula: Vt = √(Δρ / (ρg × CD))\n` +
        `Substitute: Vt = √((${deltaRho.toFixed(2)}) / (${rhoG.toFixed(
          2
        )} × ${CD}))\n` +
        `Vt = ${Vt.toFixed(2)} ft/s`
    );

    // Step 4: Gas Capacity Constraint - Diameter (d)
    const dGas = Math.sqrt(
      (5.040 * 0.84 * gasFlowRate * 10 ** 6) / (Math.sqrt(CD) * pressure * deltaRho)
    ); // in
    stepLogs.push(
      `**Step 4:** Calculate Gas Capacity Constraint Diameter (d):\n` +
        `Formula: d = √((5.040 × Z × Qg × 10⁶) / (√CD × P × Δρ))\n` +
        `Substitute: d = √((5.040 × 0.84 × ${gasFlowRate} × 10⁶) / (√${CD} × ${pressure} × ${deltaRho.toFixed(
          2
        )}))\n` +
        `d = ${dGas.toFixed(2)} in`
    );

    // Step 5: Liquid Capacity Constraint - Height (h)
    const diameterFt = dGas / 12; // Convert diameter to feet
    const hLiquid = (retentionTime * oilFlowRate) / (0.12 * diameterFt ** 2); // in
    stepLogs.push(
      `**Step 5:** Calculate Liquid Capacity Constraint Height (h):\n` +
        `Formula: h = (t × Qo) / (0.12 × d²)\n` +
        `Substitute: h = (${retentionTime} × ${oilFlowRate}) / (0.12 × (${diameterFt.toFixed(
          2
        )} ft)²)\n` +
        `h = ${hLiquid.toFixed(2)} in`
    );

    // Step 6: Seam-to-Seam Length (Lss)
    const Lss = hLiquid + 76; // Add headspace (in)
    stepLogs.push(
      `**Step 6:** Calculate Seam-to-Seam Length (Lss):\n` +
        `Formula: Lss = h + 76\n` +
        `Substitute: Lss = ${hLiquid.toFixed(2)} + 76\n` +
        `Lss = ${Lss.toFixed(2)} in`
    );

    // Store steps
    setSteps(stepLogs);
  };

  return (
    <div className="md:py-10 bg-gradient-to-r from-purple-300 to-blue-500">
      <Card className="max-w-4xl mx-auto shadow-md p-6">
        <h1 className="md:text-3xl font-bold text-purple-700 mb-6 text-center">
          Two-Phase Separator Calculator
        </h1>
        <div className="space-y-6">
          {Object.keys(inputs).map((key) => (
            <div key={key} className="flex flex-col">
              <Input
                fullWidth
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                name={key}
                type="number"
                value={inputs[key as keyof typeof inputs].toString()} // Convert number to string
                onChange={handleInputChange}
              />
            </div>
          ))}
          <Spacer y={1.5} />
          <Button
            onClick={calculateSeparator}
            color="primary"
            style={{ width: '100%', backgroundColor: '#6B3F97' }} // Purple button
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
          <Card style={{ marginTop: '2rem' }} className="p-4 shadow-inner bg-purple-50">
            <h2 className="text-xl font-semibold text-purple-700 mb-4">
              Step-by-Step Results
            </h2>
            <ol className="list-decimal space-y-4 pl-6 text-purple-800">
              {steps.map((step, index) => (
                <li key={index} className="text-sm md:text-base leading-relaxed whitespace-pre-line">
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

export default TwoPhaseCalculator;
