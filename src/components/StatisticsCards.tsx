// StatisticsCards Component
const StatisticsCards = () => {
    const stats = [
        { label: "本日の売上", value: "¥125,400", change: "+12.5%", color: "text-green-500" },
        { label: "本日の注文数", value: "42", change: "+8.3%", color: "text-green-500" },
        { label: "在庫切れ商品", value: "7", change: "+2", color: "text-red-500" },
        { label: "新規顧客数", value: "15", change: "+25%", color: "text-green-500" },
    ];

    return (
        <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((card, index) => (
                <div key={index} className="bg-white p-6 shadow rounded-lg">
                    <p className="text-gray-600">{card.label}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                    <p className={card.color}>{card.change} 前日比</p>
                </div>
            ))}
        </div>
    );
};

export default StatisticsCards;