﻿// ==========================================================================
//  Squidex Headless CMS
// ==========================================================================
//  Copyright (c) Squidex UG (haftungsbeschränkt)
//  All rights reserved. Licensed under the MIT license.
// ==========================================================================

using NodaTime;
using Squidex.Infrastructure;
using System;

namespace Squidex.Domain.Apps.Core.Comments
{
    public sealed class Comment
    {
        public Guid Id { get; }

        public Instant Time { get; }

        public RefToken User { get; }

        public string Text { get; }

        public Comment(Guid id, Instant time, RefToken user, string text)
        {
            Id = id;
            Time = time;
            Text = text;
            User = user;
        }
    }
}
