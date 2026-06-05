"use client";

import React, { useState } from "react";
import { Card, Tag, Button } from "antd";
import { PlusOutlined, HeartOutlined } from "@ant-design/icons";
import type { Book } from "@/components/landing/landing-data";

// Renders the recommended grid section.
export default function RecommendedGrid({ books, onAddToCart }: { books: Book[]; onAddToCart: (book: Book) => void }) {
  const [added, setAdded] = useState<Record<string, boolean>>({});

  // Renders the handle add section.
  function handleAdd(book: Book) {
    onAddToCart(book);
    setAdded((current) => ({ ...current, [book.isbn]: true }));
    window.setTimeout(() => {
      setAdded((current) => ({ ...current, [book.isbn]: false }));
    }, 900);
  }

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Picked for you</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {books.length === 0 ? (
          <Card style={{ borderRadius: 12 }}>No recommendations yet.</Card>
        ) : null}
        {books.map((b) => (
          <Card key={b.isbn} style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{b.title}</div>
                <div style={{ color: '#888', fontSize: 13 }}>{b.author}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>${b.price.toFixed(2)}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <Button icon={<PlusOutlined />} onClick={() => handleAdd(b)} />
                  <Button icon={<HeartOutlined />} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
