function Hero({ onSearch }) {
    const [origin, setOrigin] = React.useState('');
    const [destination, setDestination] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch({ origin, destination });
    };

    return (
        <section className="relative h-[500px] flex items-center justify-center bg-[var(--primary-color)] overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1494412574643-35d324698420?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-[var(--primary-color)] opacity-60"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center">
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide">
                        国际海运现舱交易平台
                    </h1>
                    <p className="text-xl md:text-2xl text-[var(--accent-color)] font-light tracking-wider italic font-serif">
                        真实、高效、实时
                    </p>
                </div>

                <div className="max-w-4xl mx-auto glass-panel p-6 rounded-md">
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full text-left">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">起运港 (Origin)</label>
                            <div className="relative">
                                <div className="absolute left-3 top-3 text-gray-400">
                                    <div className="icon-map-pin"></div>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="例如: Shanghai" 
                                    className="input-field pl-10"
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-center md:pb-3 text-gray-400">
                            <div className="icon-arrow-right md:hidden"></div>
                            <div className="icon-arrow-right hidden md:block"></div>
                        </div>

                        <div className="flex-1 w-full text-left">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">目的港 (Destination)</label>
                            <div className="relative">
                                <div className="absolute left-3 top-3 text-gray-400">
                                    <div className="icon-map-pin"></div>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="例如: Los Angeles" 
                                    className="input-field pl-10"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-accent h-[46px] w-full md:w-auto min-w-[120px]">
                            <div className="icon-search text-lg"></div>
                            查询
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}