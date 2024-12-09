import React from 'react';

interface UnitSwitchProps {
  unitType: 'SI' | 'Field';
  setUnitType: (type: 'SI' | 'Field') => void;
}

const UnitSwitch: React.FC<UnitSwitchProps> = ({ unitType, setUnitType }) => {
  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => setUnitType('SI')}
        className={`px-4 py-2 ${
          unitType === 'SI' ? 'bg-blue-500 text-white' : 'bg-gray-300'
        } rounded`}
      >
        SI Units
      </button>
      <button
        onClick={() => setUnitType('Field')}
        className={`px-4 py-2 ${
          unitType === 'Field' ? 'bg-blue-500 text-white' : 'bg-gray-300'
        } rounded`}
      >
        Field Units
      </button>
    </div>
  );
};

export default UnitSwitch;
