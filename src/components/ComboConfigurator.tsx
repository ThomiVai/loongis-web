import {
  useState,
  type ChangeEvent,
} from "react";

import {
  FaArrowLeftLong,
  FaCheck,
} from "react-icons/fa6";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import type {
  CartItem,
} from "../context/CartContext";

import {
  useCart,
} from "../hooks/useCart";

import {
  useNotification,
} from "../hooks/useNotification";

import {
  CatalogImage,
} from "./CatalogImage";

import type {
  Product,
  ProductChoiceSelection,
  ProductCustomization,
} from "../types/Product";

import "../styles/ProductDetail.css";
import "../styles/ComboConfigurator.css";

const priceFormatter =
  new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    },
  );

type ComboConfiguratorProps = {
  product: Product;
  editCartItem?: CartItem;
};

const burgerOptionImages:
  Record<string, string> = {
  "solo-queso":
    "/images/burgers/simple-queso.png",
  clasic:
    "/images/burgers/loongis-clasic.png",
  bacon:
    "/images/burgers/loongis-bacon.png",
  crispy:
    "/images/burgers/loongis-crispy.png",
};

function createInitialChoices(
  product: Product,
  editCartItem?: CartItem,
): ProductChoiceSelection[] {
  return (
    product.choiceGroups ?? []
  ).map((group) => {
    const storedChoice =
      editCartItem?.customization
        .choices?.find(
          (choice) =>
            choice.groupId === group.id &&
            group.options.some(
              (option) =>
                option.id === choice.option.id,
            ),
        );

    return storedChoice ?? {
      groupId: group.id,
      groupLabel: group.label,
      option: group.options[0],
      removedIngredients: [],
    };
  });
}

export function ComboConfigurator({
  product,
  editCartItem,
}: ComboConfiguratorProps) {
  const navigate = useNavigate();
  const { addProduct, updateCartItem } =
    useCart();
  const { showNotification } =
    useNotification();

  const [choices, setChoices] =
    useState<ProductChoiceSelection[]>(
      () =>
        createInitialChoices(
          product,
          editCartItem,
        ),
    );

  const [notes, setNotes] =
    useState(
      editCartItem?.customization.notes ?? "",
    );

  const handleOptionChange = (
    groupId: string,
    optionId: string,
  ) => {
    const group = product.choiceGroups?.find(
      (candidate) => candidate.id === groupId,
    );

    const option = group?.options.find(
      (candidate) => candidate.id === optionId,
    );

    if (!group || !option) {
      return;
    }

    setChoices((current) =>
      current.map((choice) =>
        choice.groupId === groupId
          ? {
              groupId,
              groupLabel: group.label,
              option,
              removedIngredients: [],
            }
          : choice,
      ),
    );
  };

  const handleRemovedIngredient = (
    groupId: string,
    ingredient: string,
  ) => {
    setChoices((current) =>
      current.map((choice) => {
        if (choice.groupId !== groupId) {
          return choice;
        }

        const isRemoved =
          choice.removedIngredients.includes(
            ingredient,
          );

        return {
          ...choice,
          removedIngredients: isRemoved
            ? choice.removedIngredients.filter(
                (item) => item !== ingredient,
              )
            : [
                ...choice.removedIngredients,
                ingredient,
              ],
        };
      }),
    );
  };

  const customization:
    ProductCustomization = {
    choices,
    extras: [],
    removedIngredients: [],
    notes: notes.trim(),
  };

  const handleSave = () => {
    if (editCartItem) {
      updateCartItem(
        editCartItem.cartItemId,
        customization,
      );
    } else {
      addProduct(product, customization);
      showNotification(
        `${product.name} se agregó a tu pedido.`,
        "success",
      );
    }

    navigate("/carrito", { replace: true });
  };

  return (
    <main className="product-detail">
      <section className="product-detail__content">
        <div className="product-detail__container">
          <Link
            className="product-detail__back"
            to={editCartItem ? "/carrito" : "/menu"}
          >
            <FaArrowLeftLong aria-hidden="true" />
            <span>
              {editCartItem
                ? "Volver al carrito"
                : "Volver al menú"}
            </span>
          </Link>

          <div className="product-detail__layout">
            <div className="product-detail__visual">
              <div className="product-detail__image-background">
                <img
                  className="product-detail__image"
                  src={product.image}
                  alt={product.imageAlt}
                />
              </div>
            </div>

            <div className="product-detail__information">
              <span className="product-detail__category">
                Combos
              </span>

              <h1 className="product-detail__title">
                {product.name}
              </h1>

              <p className="product-detail__description">
                {product.description}
              </p>

              <div className="product-detail__price-row">
                <div>
                  <span className="product-detail__price-label">
                    Precio
                  </span>
                  <strong className="product-detail__price">
                    {priceFormatter.format(product.price)}
                  </strong>
                </div>
              </div>

              {(product.choiceGroups ?? []).map(
                (group) => {
                  const choice = choices.find(
                    (item) => item.groupId === group.id,
                  );

                  if (!choice) {
                    return null;
                  }

                  const optionKind =
                    choice.option.kind;

                  const fixedImage =
                    optionKind === "burger"
                      ? burgerOptionImages[
                          choice.option.id
                        ]
                      : undefined;

                  return (
                    <fieldset
                      className={`product-customization combo-configurator__group combo-configurator__group--${optionKind}`}
                      key={group.id}
                    >
                      <legend className="product-customization__title">
                        {group.label}
                      </legend>

                      {group.options.length === 1 ? (
                        <div className="combo-configurator__fixed-choice">
                          {fixedImage && (
                            <CatalogImage
                              className="combo-configurator__fixed-image"
                              src={fixedImage}
                              alt={choice.option.label}
                              variant="card"
                              sizes="92px"
                              loading="lazy"
                            />
                          )}

                          <div className="combo-configurator__fixed-copy">
                            <small>
                              Selección del día
                            </small>
                            <strong>
                              {choice.option.label}
                            </strong>
                          </div>

                          <span className="combo-configurator__check combo-configurator__check--visible">
                            <FaCheck aria-hidden="true" />
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`combo-configurator__options combo-configurator__options--${optionKind}`}
                          role="radiogroup"
                          aria-label={group.label}
                        >
                          {group.options.map((option) => {
                            const isSelected =
                              choice.option.id ===
                              option.id;

                            const burgerImage =
                              option.kind === "burger"
                                ? burgerOptionImages[
                                    option.id
                                  ]
                                : undefined;

                            return (
                              <button
                                key={option.id}
                                className={`combo-configurator__option combo-configurator__option--${option.kind} combo-configurator__option--${option.id} ${
                                  isSelected
                                    ? "combo-configurator__option--selected"
                                    : ""
                                }`}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() =>
                                  handleOptionChange(
                                    group.id,
                                    option.id,
                                  )
                                }
                              >
                                {burgerImage ? (
                                  <CatalogImage
                                    className="combo-configurator__option-image"
                                    src={burgerImage}
                                    alt=""
                                    variant="card"
                                    sizes="76px"
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="combo-configurator__beverage-mark">
                                    {option.label.charAt(0)}
                                  </span>
                                )}

                                <span className="combo-configurator__option-copy">
                                  <strong>
                                    {option.label}
                                  </strong>
                                  <small>
                                    {isSelected
                                      ? "Elegida"
                                      : "Seleccionar"}
                                  </small>
                                </span>

                                <span className={`combo-configurator__check ${
                                  isSelected
                                    ? "combo-configurator__check--visible"
                                    : ""
                                }`}>
                                  <FaCheck aria-hidden="true" />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {choice.option.ingredients.length > 0 && (
                        <div className="product-ingredients">
                          {choice.option.ingredients.map(
                            (ingredient) => (
                              <label
                                className={`product-ingredient ${
                                  choice.removedIngredients.includes(
                                    ingredient,
                                  )
                                    ? "product-ingredient--removed"
                                    : ""
                                }`}
                                key={ingredient}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    choice.removedIngredients.includes(
                                      ingredient,
                                    )
                                  }
                                  onChange={() =>
                                    handleRemovedIngredient(
                                      group.id,
                                      ingredient,
                                    )
                                  }
                                />
                                <span>Sin {ingredient}</span>
                              </label>
                            ),
                          )}
                        </div>
                      )}
                    </fieldset>
                  );
                },
              )}

              <label className="product-notes">
                <span className="product-notes__title">
                  Aclaración general del combo
                </span>
                <textarea
                  value={notes}
                  onChange={(
                    event: ChangeEvent<HTMLTextAreaElement>,
                  ) => setNotes(event.target.value)}
                  maxLength={140}
                  rows={3}
                />
              </label>

              <button
                className="product-detail__add-button"
                type="button"
                onClick={handleSave}
              >
                {editCartItem
                  ? "Guardar cambios"
                  : "Agregar al pedido"}
                {" · "}
                {priceFormatter.format(product.price)}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
