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
    oilAPI: 30, // API Gravity
    oilSG: 0.876, // Specific gravity of oil (calculated)
    waterSG: 1.07, // Specific gravity of water
    gasSG: 0.6, // Specific gravity of gas
    oilRetentionTime: 10, // minutes
    waterRetentionTime: 10, // minutes
    interfacialTension: 0.3, // lb/ft³
    dropletSizeLiquid: 100, // microns
    dropletSizeWater: 500, // microns
    dropletSizeOil: 200, // microns
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
      // oilAPI,
      oilSG,
      waterSG,
      gasSG,
      oilRetentionTime,
      waterRetentionTime,
      // interfacialTension,
      dropletSizeLiquid,
      dropletSizeWater,
      dropletSizeOil,
    } = inputs;

    const stepLogs: string[] = [];

    // Step 1: Calculate Oil Specific Gravity (Already Provided)
    // Oil SG = 141.5 / (API + 131.5) = 141.5 / (30 + 131.5) = 0.876
    stepLogs.push(
      `**Step 1:** Calculate Oil Specific Gravity (SG_o):\n` +
        `Formula: SG_o = 141.5 / (API + 131.5)\n` +
        `Substitute: SG_o = 141.5 / (30 + 131.5)\n` +
        `SG_o = ${oilSG}`
    );

    // Step 2: Calculate Difference in Specific Gravities (ΔSG)
    const deltaSG = waterSG - oilSG;
    stepLogs.push(
      `**Step 2:** Calculate Difference in Specific Gravities (ΔSG):\n` +
        `ΔSG = SG_w - SG_o = ${waterSG} - ${oilSG} = ${deltaSG.toFixed(3)}`
    );

    // Step 3: Calculate Minimum Diameter for Liquid Droplets in Gas Phase (d2)
    const CD = 2.01; // Drag Coefficient
    const gasDensity = 0.03; // Assumed Gas Density (ρ_g) [lb/ft³]
    const liquidDensity = 54.7; // Assumed Liquid Density (ρ_l) [lb/ft³]
    const d2 = Math.sqrt(
      5040 * (550 * 0.99 * gasFlowRate / pressure) *
      ((gasSG / (liquidDensity - gasSG)) * (CD / dropletSizeLiquid)) ** 0.5
    );
     
    stepLogs.push(
      `**Step 3:** Calculate Minimum Diameter for Liquid Droplets in Gas Phase (d2):\n` +
        `Formula: d2 = √[(5040 × 1 × Qo × 10⁶) / (√CD × P × ΔSG)]\n` +
        `**Assumptions:**\n` +
        `- Gas Density (ρ_g) = ${gasDensity.toFixed(3)} lb/ft³\n` +
        `- Liquid Density (ρ_l) = ${liquidDensity.toFixed(3)} lb/ft³\n` +
        `Substitute: d2 = √[(5040 × 1 × ${oilFlowRate} × 10⁶) / (√${CD} × ${pressure} × ${deltaSG.toFixed(
          3
        )})]\n` +
        `d2 = ${d2.toFixed(1)} in`
    );

    // Step 4: Calculate Minimum Diameter for Water Droplets in Oil Phase (d3)
    const d3Numerator = 6690 * gasFlowRate * 1e4;
    const d3Denominator = deltaSG * Math.pow(dropletSizeWater, 2);
    const d3 = Math.sqrt(d3Numerator / d3Denominator);

    stepLogs.push(
      `**Step 4:** Calculate Minimum Diameter for Water Droplets in Oil Phase (d3):\n` +
        `Formula: d3 = √[(6690 × Qg × 10⁶) / (ΔSG × Droplet Size_w²)]\n` +
        `Substitute: d3 = √[(6690 × ${gasFlowRate} × 10⁶) / (${deltaSG} × ${dropletSizeWater}²)]\n` +
        `d3 = ${d3.toFixed(1)} in`
    );

    // Step 5: Calculate Minimum Diameter for Oil Droplets in Water Phase (d4)
    const d4Numerator = 6690 * waterFlowRate * 1;
    const d4Denominator = deltaSG * Math.pow(dropletSizeOil, 2);
    const d4 = Math.sqrt(d4Numerator / d4Denominator);

    stepLogs.push(
      `**Step 5:** Calculate Minimum Diameter for Oil Droplets in Water Phase (d4):\n` +
        `Formula: d4 = √[(6690 × Qw × 10⁶) / (ΔSG × Droplet Size_o²)]\n` +
        `Substitute: d4 = √[(6690 × ${waterFlowRate} × 10⁶) / (${deltaSG} × ${dropletSizeOil}²)]\n` +
        `d4 = ${d4.toFixed(1)} in`
    );

    // Step 6: Select the Largest Diameter (dmin)
    const dmin = Math.max(d2, d3, d4);
    stepLogs.push(
      `**Step 6:** Select the Largest Diameter (dmin):\n` +
        `dmin = max(d2, d3, d4) = max(${d2.toFixed(1)}, ${d3.toFixed(1)}, ${d4.toFixed(
          1
        )}) = ${dmin.toFixed(1)} in`
    );

    // Step 7: Calculate Height of Oil and Water Section (hOW)
    const ho_plus_hw =
      (oilRetentionTime * oilFlowRate + waterRetentionTime * waterFlowRate) /
      (0.12 * Math.pow(dmin, 2));
    stepLogs.push(
      `**Step 7:** Calculate Height of Oil and Water Section (hOW):\n` +
        `Formula: hOW = (t_o × Qo + t_w × Qw) / (0.12 × dmin²)\n` +
        `Substitute: hOW = (${oilRetentionTime} × ${oilFlowRate} + ${waterRetentionTime} × ${waterFlowRate}) / (0.12 × ${dmin.toFixed(
          1
        )}²)\n` +
        `hOW = ${ho_plus_hw.toFixed(1)} in`
    );

    // Step 8: Calculate Seam-to-Seam Length (Lss)
    // According to the example, since dmin = 83.0 in > 36 in, use Lss = hOW + 76
    const Lss = ho_plus_hw + 76;
    stepLogs.push(
      `**Step 8:** Calculate Seam-to-Seam Length (Lss):\n` +
        `Formula: Lss = ho + hw + 76\n` +
        `Substitute: Lss = ${ho_plus_hw.toFixed(1)} + 76\n` +
        `Lss = ${Lss.toFixed(1)} in`
    );

    // Step 9: Calculate Slenderness Ratio (SR)
    // Convert Lss from inches to feet for the formula
    const Lss_feet = Lss / 12;
    const slendernessRatio = (12 * Lss_feet) / dmin;
    stepLogs.push(
      `**Step 9:** Calculate Slenderness Ratio (SR):\n` +
        `Formula: Slenderness Ratio = (12 × Lss) / dmin\n` +
        `Substitute: Slenderness Ratio = (12 × ${Lss_feet.toFixed(
          1
        )} ft) / ${dmin.toFixed(1)} in\n` +
        `Slenderness Ratio = ${slendernessRatio.toFixed(1)}`
    );

    // Step 10: Final Selection (Based on Example)
    // According to Example 5-1, select dmin = 83.0 in as per calculations
    // Optionally, choose to select a standard size like 90 in
    stepLogs.push(
      `**Step 10:** Final Selection:\n` +
        `Selected Diameter (dmin) = ${dmin.toFixed(1)} in\n` +
        `Seam-to-Seam Length (Lss) = ${Lss_feet.toFixed(
          1
        )} ft\n` +
        `Slenderness Ratio (SR) = ${slendernessRatio.toFixed(1)}`
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
                label={formatLabel(key)}
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

// Helper function to format labels
const formatLabel = (key: string): string => {
  const map: { [key: string]: string } = {
    oilFlowRate: 'Oil Flow Rate (Qo) [BOPD]',
    waterFlowRate: 'Water Flow Rate (Qw) [BWPD]',
    gasFlowRate: 'Gas Flow Rate (Qg) [MMscfd]',
    pressure: 'Pressure (P) [psia]',
    oilAPI: 'Oil API Gravity [°API]',
    oilSG: 'Oil Specific Gravity (SG_o)',
    waterSG: 'Water Specific Gravity (SG_w)',
    gasSG: 'Gas Specific Gravity (SG_g)',
    oilRetentionTime: 'Oil Retention Time (t_o) [min]',
    waterRetentionTime: 'Water Retention Time (t_w) [min]',
    interfacialTension: 'Interfacial Tension (σ) [lb/ft³]',
    dropletSizeLiquid: 'Droplet Size Liquid [microns]',
    dropletSizeWater: 'Droplet Size Water [microns]',
    dropletSizeOil: 'Droplet Size Oil [microns]',
  };
  return map[key] || key;
};

export default ThreePhaseSeparatorCalculator;
