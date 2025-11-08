export interface GraphCardProps {
  id: string;
  title: string;
  description: string;
  subject: string;
  imageUrl?: string;
  views: number;
  tags: string[];
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  isFavorite?: boolean;
  onFavorite?: (id: string) => void;
}

export const GraphCard: React.FC<GraphCardProps> = ({
  id,
  title,
  description,
  subject,
  imageUrl,
  views,
  tags,
  onView,
  onDownload,
  isFavorite = false,
  onFavorite
}) => {
  const subjectIcons = {
    physics: 'atom',
    chemistry: 'vial',
    biology: 'dna',
    mathematics: 'calculator'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-t-xl overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <i className={`fas fa-${subjectIcons[subject] || 'chart-line'} text-4xl`} />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          {subject}
        </div>
        {onFavorite && (
          <button
            onClick={() => onFavorite(id)}
            className="absolute top-3 left-3 text-white hover:text-red-500 transition-colors"
          >
            <i className={`fas fa-heart ${isFavorite ? 'text-red-500' : 'text-white/70'}`} />
          </button>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <i className="fas fa-eye" />
            <span>{views.toLocaleString()} views</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onView(id)}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View
            </button>
            <button
              onClick={() => onDownload(id)}
              className="text-gray-600 hover:text-gray-700 text-sm font-medium"
            >
              <i className="fas fa-download" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
