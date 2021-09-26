using System;
using TikTacToeGame.Events;

namespace TikTacToeGame
{
    public interface IPlayerConnection
    {
        event EventHandler<object> MessageReceived;

        event EventHandler Disconnected;

        void SendEvent(EventType eventType, object eventData);
    }
}