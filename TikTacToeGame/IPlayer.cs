using System;
using TikTacToeGame.Events;

namespace TikTacToeGame
{
    public interface IPlayer
    {
        event EventHandler<Move> Moved;

        event EventHandler<PlayerReady> OnReady;

        event EventHandler<string> ChatMessageSent;

        event EventHandler Disconnected;

        Mark Mark { get; set; }

        string Name { get; set; }

        Game Game { get; set; }

        void SendError(ErrorType errorType, string message);
    }
}