import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import DropdownMenu from "../board/Dropdown";
import AddCard from "./AddCard";
import { Draggable, Droppable } from "@hello-pangea/dnd";

const List = ({ list, index, onDeleteList }) => {
  const listId = list._id || list.id;
  const queryClient = useQueryClient();
const api_url = "https://trello-7fyi-git-main-tayyabs-projects-9d235f55.vercel.app";
  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["cards", listId],
    queryFn: async () => {
      const res = await axios.get(
        `${api_url}/api/card/${listId}/cards`
      );
      return res.data.cards || [];
    },
    enabled: !!listId,
  });

  const addCardMutation = useMutation({
    mutationFn: async (card) => {
      const res = await axios.post(
        `${api_url}/api/card/${listId}/cards`,
        card
      );
      return res.data.card;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cards", listId]);
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId) => {
      await axios.delete(`${api_url}/api/card/${cardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cards", listId]);
    },
  });

  return (
    <Draggable draggableId={listId} index={index}>
      {(provided) => (
        <div
          className="bg-gray-100/90 rounded-lg p-3 w-64 flex-shrink-0 shadow"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div
            className="flex justify-between items-center mb-3"
            {...provided.dragHandleProps}
          >
            <h3 className="font-semibold">{list.title}</h3>
            <DropdownMenu onDelete={() => onDeleteList(listId)} />
          </div>

          <Droppable droppableId={listId} type="card">
            {(provided) => (
              <div
                className="space-y-2"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {isLoading ? (
                  <p className="text-gray-500 text-sm">Loading cards...</p>
                ) : cards.length > 0 ? (
                  cards.map((card, index) => {
                    const cardId = card._id || card.id;
                    return (
                      <Draggable
                        key={cardId}
                        draggableId={cardId}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-2 rounded shadow flex justify-between items-center"
                          >
                            <span>{card.title}</span>
                            <DropdownMenu
                              onDelete={() => deleteCardMutation.mutate(cardId)}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm">No cards yet</p>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <AddCard
            listId={listId}
            onAdd={(card) => addCardMutation.mutate(card)}
          />
        </div>
      )}
    </Draggable>
  );
};

export default List;
