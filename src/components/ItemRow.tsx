import FormField from "./FormField";
import NumberField from "./NumberField";
import MoneyField from "./MoneyField";
import { Button } from "./Button";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface ItemRowProps {
  item: InvoiceItem;
  index: number;
  onUpdate: (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => void;
  onRemove: (index: number) => void;
  showRemove?: boolean;
}

export default function ItemRow({
  item,
  index,
  onUpdate,
  onRemove,
  showRemove = true,
}: ItemRowProps) {
  const total = item.quantity * item.unitPrice;

  return (
    <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
      <div className="flex-grow">
        <FormField
          label="Description"
          value={item.description}
          onChange={(value) => onUpdate(index, "description", value)}
          placeholder="Item description"
        />
      </div>
      <div className="w-24">
        <NumberField
          label="Qty"
          value={item.quantity}
          onChange={(value) => onUpdate(index, "quantity", value)}
          min={1}
        />
      </div>
      <div className="w-32">
        <MoneyField
          label="Unit Price"
          value={item.unitPrice}
          onChange={(value) => onUpdate(index, "unitPrice", value)}
        />
      </div>
      <div className="w-32 pt-8">
        <div className="text-right">
          <span className="text-lg font-semibold text-gray-900">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
      {showRemove && (
        <div className="pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
