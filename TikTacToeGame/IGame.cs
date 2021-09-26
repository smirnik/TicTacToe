using System;
using System.Collections.Generic;
using TikTacToeGame.Events;
using TikTacToeGame.Events.Status;

namespace TikTacToeGame
{
    public interface IGame
    {
        event EventHandler<NextMove> NextMove;

        event EventHandler<Move> PlayerMoved;

        event EventHandler<Status> GameStutusChanged;

        event EventHandler<ChatMessage> ChatMessageSent;

        event EventHandler<PlayerLeaved> PlayerLeaved;

        GameStatus GameStatus { get; }

        void AddPlayer(IPlayer player);

        IEnumerable<string> GetPlayersNames();
    }
}