﻿// ==========================================================================
//  Squidex Headless CMS
// ==========================================================================
//  Copyright (c) Squidex UG (haftungsbeschränkt)
//  All rights reserved. Licensed under the MIT license.
// ==========================================================================

using System;
using System.Collections.Generic;
using NodaTime;
using Squidex.Domain.Apps.Entities.History;
using Squidex.Infrastructure;

namespace Squidex.Domain.Apps.Entities.MongoDb.History
{
    internal sealed class ParsedHistoryEvent : IHistoryEventEntity
    {
        private readonly MongoHistoryEventEntity inner;
        private readonly Lazy<string> message;

        public Guid Id
        {
            get { return inner.Id; }
        }

        public Guid EventId
        {
            get { return inner.Id; }
        }

        public Instant Created
        {
            get { return inner.Created; }
        }

        public Instant LastModified
        {
            get { return inner.LastModified; }
        }

        public RefToken Actor
        {
            get { return inner.Actor; }
        }

        public long Version
        {
            get { return inner.Version; }
        }

        public string Channel
        {
            get { return inner.Channel; }
        }

        public string Message
        {
            get { return message.Value; }
        }

        public ParsedHistoryEvent(MongoHistoryEventEntity inner, IReadOnlyDictionary<string, string> texts)
        {
            this.inner = inner;

            message = new Lazy<string>(() =>
            {
                var result = texts[inner.Message];

                foreach (var kvp in inner.Parameters)
                {
                    result = result.Replace("[" + kvp.Key + "]", kvp.Value);
                }

                return result;
            });
        }
    }
}
