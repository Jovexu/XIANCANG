function AdSection() {
    return (
        <section className="container mx-auto px-4 mt-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Advertisement Box */}
                <div className="rounded-lg overflow-hidden shadow-md group relative h-64 md:h-80 cursor-pointer">
                    <img 
                        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                        alt="Logistics Ad" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
                        <span className="bg-[var(--accent-color)] text-white text-xs font-bold px-2 py-1 rounded w-fit mb-2">
                            广告推荐
                        </span>
                        <h3 className="text-white text-2xl font-serif font-bold mb-1">全球航线特惠季</h3>
                        <p className="text-gray-200 text-sm">欧美航线限时 8 折起，立即预订锁定舱位</p>
                    </div>
                </div>

                {/* Video Player Box */}
                <div className="rounded-lg overflow-hidden shadow-md bg-black relative h-64 md:h-80 group">
                    <video 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                        poster="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                        controls
                    >
                        <source src="https://media.istockphoto.com/id/1363636473/video/aerial-view-of-container-ship-in-the-sea.mp4?s=mp4-640x640-is&k=20&c=13yT73-y-8tK5lE3K3y5M5q5Kq4y8tK5lE3K3y5M5q5Kq4y8tK5lE3K3y5M5q5Kq4y8" type="video/mp4" />
                        您的浏览器不支持视频播放。
                    </video>
                    
                    {/* Play Button Overlay (Optional visual cue if native controls are hidden or for aesthetic) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <div className="icon-circle-play text-5xl text-white opacity-90"></div>
                        </div>
                    </div>
                    
                    <div className="absolute top-4 left-4">
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <div className="icon-play w-3 h-3 fill-current"></div>
                            企业宣传
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}