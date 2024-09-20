import Image from 'next/image';

export default function PlantCard({ plant }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <Image
        src={plant.image}
        alt={plant.name}
        width={200}
        height={200}
        className="rounded-lg"
      />
      <h2 className="text-lg font-bold mb-2">{plant.name}</h2>
      <p className="text-gray-600">{plant.description}</p>
    </div>
  );
}