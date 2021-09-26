using TikTacToeGame.Events;

namespace TicTacToeWebApp.Game.WebSocketPlayerConnection
{
    public interface IMessageSerializer
    {
        string Serialize(EventType eventType, object eventObject);
        object Deserialize(string message);
    }
}
