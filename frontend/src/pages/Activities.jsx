import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Activities = () => {
  const { orgId } = useParams();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    document.title = "Activities | Trello";
    const fetchActivities = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/activities/${orgId}`
        );
        if (res.data.status) {
          setActivities(res.data.activities);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchActivities();
  }, [orgId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Recent Activities</h1>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm border"
          >
            {/* Avatar placeholder */}
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              {activity.user?.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="text-sm text-gray-800">
                <span className="font-semibold">{activity.user?.name}</span>{" "}
                {activity.action}{" "}
                {activity.board && (
                  <span className="font-medium text-blue-600">
                    {activity.board.title}
                  </span>
                )}
                {activity.list && (
                  <>
                    {" in list "}
                    <span className="font-medium text-green-600">
                      {activity.list.title}
                    </span>
                  </>
                )}
                {activity.card && (
                  <>
                    {" (card: "}
                    <span className="italic text-purple-600">
                      {activity.card.title}
                    </span>
                    {")"}
                  </>
                )}
              </p>
              {activity.details && (
                <p className="text-xs text-gray-500">{activity.details}</p>
              )}
              <p className="text-xs text-gray-400">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activities;
