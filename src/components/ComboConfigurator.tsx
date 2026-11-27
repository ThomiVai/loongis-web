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

import {
  getDailyComboImage,
} from "../utils/dailyComboImage";

import type {
  Product,
  ProductChoiceGroup,
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

const beverageOptionImages = {
  "coca-cola": "/images/beverages/coca-cola.webp",
  pepsi: "/images/beverages/pepsi.webp",
  sprite: "/images/beverages/sprite.webp",
  villavicencio: "/images/beverages/villavicencio.webp",
} as const;

function normalizeOptionName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getBeverageImage(optionId: string, label: string): string | undefined {
  const optionName = normalizeOptionName(`${optionId} ${label}`);

  if (optionName.includes("sprite")) return beverageOptionImages.sprite;
  if (optionName.includes("pepsi")) return beverageOptionImages.pepsi;
  if (optionName.includes("coca") || optionName.includes("cola")) {
    return beverageOptionImages["coca-cola"];
  }
  if (optionName.includes("villavicencio") || optionName.includes("agua")) {
    return beverageOptionImages.villavicencio;
  }

  return undefined;
}

function isCheeseIngredient(ingredient: string): boolean {
  return /\b(queso|cheese)\b/.test(normalizeOptionName(ingredient));
}

function sanitizeBurgerChoiceIngredients(product: Product): Product {
  if (!product.choiceGroups) return product;

  return {
    ...product,
    choiceGroups: product.choiceGroups.map((group) => ({
      ...group,
      options: group.options.map((option) =>
        option.kind === "burger"
          ? {
              ...option,
              ingredients: option.ingredients.filter(
                (ingredient) => !isCheeseIngredient(ingredient),
              ),
            }
          : option,
      ),
    })),
  };
}

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

    const storedOption = storedChoice
      ? group.options.find((option) => option.id === storedChoice.option.id)
      : undefined;

    const defaultOption =
      product.dailyPromo &&
      group.options.some((option) => option.kind === "beverage")
        ? group.options.find(
            (option) =>
              option.kind === "beverage" &&
              option.label.toLowerCase().includes("coca"),
          ) ?? group.options[0]
        : group.options[0];

    if (storedChoice) {
      return {
        ...storedChoice,
        option: storedOption ?? storedChoice.option,
        removedIngredients: storedChoice.removedIngredients.filter(
          (ingredient) =>
            (storedOption ?? storedChoice.option).ingredients.includes(ingredient) &&
            !(
              (storedOption ?? storedChoice.option).kind === "burger" &&
              isCheeseIngredient(ingredient)
            ),
        ),
      };
    }

    return {
      groupId: group.id,
      groupLabel: group.label,
      option: defaultOption,
      removedIngredients: [],
    };
  });
}

export function ComboConfigurator({
  product: sourceProduct,
  editCartItem,
}: ComboConfiguratorProps) {
  const product = sanitizeBurgerChoiceIngredients(sourceProduct);
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

  const burgerSelectionGroups =
    (product.choiceGroups ?? []).filter(
      (group) =>
        group.options.length > 1 &&
        group.options.every((option) => option.kind === "burger"),
    );
  const hasSteppedBurgerChoices =
    burgerSelectionGroups.length >= 2;

  const [activeBurgerStep, setActiveBurgerStep] =
    useState<number | null>(
      hasSteppedBurgerChoices ? 0 : null,
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
    const selectedChoice = choices.find(
      (choice) => choice.groupId === groupId,
    );
    if (
      selectedChoice?.option.kind === "burger" &&
      isCheeseIngredient(ingredient)
    ) {
      return;
    }

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

  const renderOptions = (
    group: ProductChoiceGroup,
    choice: ProductChoiceSelection,
    stepIndex?: number,
  ) => {
    const optionKind = choice.option.kind;

    return (
      <div
        className={"combo-configurator__options combo-configurator__options--" + optionKind}
        role="radiogroup"
        aria-label={group.label}
      >
        {group.options.map((option) => {
          const isSelected = choice.option.id === option.id;
          const burgerImage =
            option.kind === "burger"
              ? burgerOptionImages[option.id]
              : undefined;
          const beverageImage =
            option.kind === "beverage"
              ? getBeverageImage(option.id, option.label)
              : undefined;

          return (
            <button
              key={option.id}
              className={
                "combo-configurator__option combo-configurator__option--" +
                option.kind +
                " combo-configurator__option--" +
                option.id +
                (isSelected
                  ? " combo-configurator__option--selected"
                  : "")
              }
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                handleOptionChange(group.id, option.id);

                if (stepIndex !== undefined) {
                  setActiveBurgerStep(
                    stepIndex < burgerSelectionGroups.length - 1
                      ? stepIndex + 1
                      : null,
                  );
                }
              }}
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
              ) : beverageImage ? (
                <img
                  className="combo-configurator__beverage-image"
                  src={beverageImage}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <span className="combo-configurator__beverage-fallback" aria-hidden="true">
                  {option.label.charAt(0)}
                </span>
              )}

              <span className="combo-configurator__option-copy">
                <strong>{option.label}</strong>
                <small>{isSelected ? "Elegida" : "Seleccionar"}</small>
              </span>

              <span
                className={
                  "combo-configurator__check" +
                  (isSelected
                    ? " combo-configurator__check--visible"
                    : "")
                }
              >
                <FaCheck aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const customization:
    ProductCustomization = {
    choices,
    extras: [],
    removedIngredients: [],
    notes: notes.trim(),
  };

  const selectedBurger =
    choices.find((choice) => choice.option.kind === "burger")?.option;
  const selectedBeverage =
    choices.find((choice) => choice.option.kind === "beverage")?.option;
  const selectedDailyComboImage = product.dailyPromo
    ? getDailyComboImage(selectedBurger, selectedBeverage)
    : undefined;

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

  const activeBurgerGroup =
    activeBurgerStep === null
      ? undefined
      : burgerSelectionGroups[activeBurgerStep];
  const activeBurgerChoice =
    activeBurgerGroup
      ? choices.find((choice) => choice.groupId === activeBurgerGroup.id)
      : undefined;

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
                  src={selectedDailyComboImage ?? product.image}
                  alt={selectedDailyComboImage
                    ? `Combo del día con ${selectedBurger?.label ?? "hamburguesa"}, papas y ${selectedBeverage?.label ?? "bebida"}`
                    : product.imageAlt}
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

              {hasSteppedBurgerChoices && (
                <section
                  className="combo-configurator__stepper"
                  aria-labelledby="combo-configurator-stepper-title"
                >
                  <div className="combo-configurator__stepper-heading">
                    <div>
                      <h2 id="combo-configurator-stepper-title">
                        Elegí tus {burgerSelectionGroups.length} hamburguesas
                      </h2>
                      <p>
                        Seleccioná una para cada lugar. Al elegir, avanzás a la siguiente.
                      </p>
                    </div>
                    <span aria-live="polite">
                      {activeBurgerStep === null
                        ? "Selección lista"
                        : "Hamburguesa " +
                          (activeBurgerStep + 1) +
                          " de " +
                          burgerSelectionGroups.length}
                    </span>
                  </div>

                  <div
                    className="combo-configurator__step-list"
                    role="group"
                    aria-label="Hamburguesas elegidas. Tocá una para cambiarla."
                  >
                    {burgerSelectionGroups.map((group, index) => {
                      const choice = choices.find(
                        (item) => item.groupId === group.id,
                      );

                      if (!choice) return null;

                      const selectedImage =
                        burgerOptionImages[choice.option.id];

                      return (
                        <button
                          key={group.id}
                          className={
                            "combo-configurator__step-summary" +
                            (activeBurgerStep === index
                              ? " combo-configurator__step-summary--active"
                              : "")
                          }
                          type="button"
                          aria-pressed={activeBurgerStep === index}
                          onClick={() => setActiveBurgerStep(index)}
                        >
                          <span className="combo-configurator__step-number">
                            {index + 1}
                          </span>
                          {selectedImage && (
                            <img
                              className="combo-configurator__step-image"
                              src={selectedImage}
                              alt=""
                              loading="lazy"
                            />
                          )}
                          <span className="combo-configurator__step-copy">
                            <small>Hamburguesa {index + 1}</small>
                            <strong>{choice.option.label}</strong>
                          </span>
                          <span className="combo-configurator__step-edit">
                            {activeBurgerStep === index ? "Editando" : "Cambiar"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {activeBurgerGroup && activeBurgerChoice && activeBurgerStep !== null ? (
                    <fieldset
                      className="product-customization combo-configurator__group combo-configurator__group--burger combo-configurator__step-options"
                      key={activeBurgerGroup.id}
                      aria-label={activeBurgerGroup.label}
                    >
                      <legend className="product-customization__title">
                        {activeBurgerGroup.label}
                      </legend>
                      {renderOptions(
                        activeBurgerGroup,
                        activeBurgerChoice,
                        activeBurgerStep,
                      )}

                      {activeBurgerChoice.option.ingredients.length > 0 && (
                        <div className="product-ingredients">
                          {activeBurgerChoice.option.ingredients.map(
                            (ingredient) => (
                              <label
                                className={
                                  "product-ingredient " +
                                  (activeBurgerChoice.removedIngredients.includes(
                                    ingredient,
                                  )
                                    ? "product-ingredient--removed"
                                    : "")
                                }
                                key={ingredient}
                              >
                                <input
                                  type="checkbox"
                                  checked={activeBurgerChoice.removedIngredients.includes(
                                    ingredient,
                                  )}
                                  onChange={() =>
                                    handleRemovedIngredient(
                                      activeBurgerGroup.id,
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
                  ) : (
                    <p className="combo-configurator__step-complete">
                      <FaCheck aria-hidden="true" />
                      {"Listo: ya elegiste tus " + burgerSelectionGroups.length + " hamburguesas. Podés tocar cualquiera para cambiarla."}
                    </p>
                  )}
                </section>
              )}

              {(product.choiceGroups ?? [])
                .filter(
                  (group) =>
                    !hasSteppedBurgerChoices ||
                    !burgerSelectionGroups.some(
                      (burgerGroup) => burgerGroup.id === group.id,
                    ),
                )
                .map(
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
                      aria-label={group.label}
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
                            <small>Selección del día</small>
                            <strong>{choice.option.label}</strong>
                          </div>

                          <span className="combo-configurator__check combo-configurator__check--visible">
                            <FaCheck aria-hidden="true" />
                          </span>
                        </div>
                      ) : (
                        renderOptions(group, choice)
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
