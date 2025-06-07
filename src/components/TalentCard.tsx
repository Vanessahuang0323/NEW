import React from 'react';
import { StudentProfile } from '../services/matchingService';
import { MapPin, Mail, GraduationCap, Briefcase } from 'lucide-react';

interface TalentCardProps {
  talent: StudentProfile;
  onSwipe: (direction: 'left' | 'right') => void;
}

const TalentCard: React.FC<TalentCardProps> = ({ talent, onSwipe }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto">
      <div className="text-center mb-4">
        <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-600">
            {talent.name.charAt(0)}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{talent.name}</h2>
        <div className="flex items-center justify-center text-gray-600 mt-1">
          <Mail className="w-4 h-4 mr-1" />
          <span className="text-sm">{talent.email}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-700">
          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
          <span className="text-sm">{talent.location}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <GraduationCap className="w-4 h-4 mr-2 text-gray-500" />
          <span className="text-sm">{talent.education}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
          <span className="text-sm">{talent.experience}</span>
        </div>

        {talent.bio && (
          <div className="mt-3">
            <p className="text-sm text-gray-600">{talent.bio}</p>
          </div>
        )}

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">技能</h3>
          <div className="flex flex-wrap gap-2">
            {talent.skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {talent.projects && talent.projects.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">專案經驗</h3>
            <div className="space-y-2">
              {talent.projects.slice(0, 2).map((project, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-800">{project.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{project.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-1 py-0.5 bg-gray-200 text-gray-700 text-xs rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentCard;